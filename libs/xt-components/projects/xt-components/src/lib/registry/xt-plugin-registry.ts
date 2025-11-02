import { XtActionHandlerInfo, XtActionInfo, XtComponentInfo, XtPluginInfo } from '../plugin/xt-plugin-info';
import { signal, Type } from '@angular/core';
import { XtComponent } from '../xt-component';

export class XtPluginRegistry {

    pluginRegistry = new Map<string, XtPluginInfo> ();
    componentRegistry = new Map<string, XtComponentInfo<any>> ();
    componentByTypeCache = new Map<string, XtComponentInfo<any>[]> ();
    protected actionByTypeRegistry = new Map<string, Map<string, XtActionInfo<any>>> ();

    listComponents = signal(new Array<XtComponentInfo<any>>());
    listPlugins = signal(new Array<XtPluginInfo>());

  /**
   * The component can manage any standard javascript primitives types. That's usually the default whenever we don't know any particular type
   * string
   * number
   * bigint
   * boolean
   * undefined
   * null
   * symbol is not managed
   * Date, while an object and not a primitive, is managed
   */
  public static readonly ANY_PRIMITIVE_TYPE="ANY_PRIMITIVE_TYPE";
  /**
   * The components can manage any composite javascript type. Default when no type has been defined and it's a user defined javascript object (not a data type)
   */
  public static readonly ANY_OBJECT_TYPE="ANY_OBJECT_TYPE";

  public static readonly ANY_PRIMITIVE_SET = "ANY_PRIMITIVE_SET";

  public static readonly ANY_OBJECT_SET = "ANY_OBJECT_SET";

  registerPlugin (info:XtPluginInfo) {
    this.pluginRegistry.set (info.name, info);

    if (info.components != null) {
      let updated=false;
      for (const comp of info.components) {
        updated=true;
        this.registerComponent (comp);
      }
      if (updated) this.componentByTypeCache.clear(); // Force recalculation of type
    }

    if( info.actionHandlers!=null) {
      for (const handler of info.actionHandlers) {
        this.registerActionHandler (handler);
      }
    }

    this.listPlugins.update((array) => {
          let found=false;
          for (let i=0; i<array.length; i++) {
            if (array[i].name==info.name) {
              found=true;
              array[i] = info;
            }
          }
          if( !found)
            array.push(info);
          return [...array]; // You have to send another value, not just update the existing one.
        });

    }

  registerComponent<T> (info:XtComponentInfo<T>) {
        this.componentRegistry.set (info.componentName, info);
        this.listComponents.update((array) => {
          let found=false;
          for (let i=0; i<array.length; i++) {
            if (array[i].componentName==info.componentName) {
              found=true;
              array[i] = info;
            }
          }
          if( !found)
            array.push(info);
          return array;
        });
    }

    findComponentsForType<T> (valueType:string|null|undefined, value?:T): XtComponentInfo<any>[] {
      let originalType=valueType;
      //console.debug('Finding type from '+valueType+' with value ',value);
        // We don't know the value type, let's try to guess if it's a primitive or object based on the value
      if ( valueType == null) {
        valueType = XtPluginRegistry.ANY_OBJECT_TYPE;
        if ((value == null) || (typeof value != 'object')) {
          valueType=XtPluginRegistry.ANY_PRIMITIVE_TYPE;
        } else if (value instanceof Date) {
          valueType=XtPluginRegistry.ANY_PRIMITIVE_TYPE;
        }

        if (Array.isArray(value)) {
          valueType = (valueType===XtPluginRegistry.ANY_PRIMITIVE_TYPE)?XtPluginRegistry.ANY_PRIMITIVE_SET:XtPluginRegistry.ANY_OBJECT_SET;
        }
      } else { // originalType has been defined.
        if (Array.isArray(value)) {
          valueType=valueType.endsWith('[]')?valueType:valueType+'[]';
          originalType=valueType;
        }
      }
      //console.debug('Type found is '+valueType);

      let ret = this.componentByTypeCache.get(valueType);
      if (ret == null) {
          ret = new Array<XtComponentInfo<any>> ()
          for (const comp of this.componentRegistry) {
              const info=comp[1];
              if (info.typesHandled.includes (valueType)) {
                  ret.push(info);
              }
          }

          if ((ret.length == 0) && (originalType!=null)) {
            // Couldn't find a specific component, let's try the generic ones, so we don't pass any type
            ret = this.findComponentsForType(null, value);
            // Cache the component only if we were able to assert its type.
            // If no type has been given and value is null, then we cannot assess the real type
            if (value!=null) {
              this.componentByTypeCache.set(originalType, ret);
            }
          } else {
            // Cache the component only if we were able to assert its type.
            // If no type has been given and value is null, then we cannot assess the real type
            if ((value!=null) || (originalType!=null)) {
              this.componentByTypeCache.set(originalType ?? valueType, ret);
            }
          }

      }
      return ret;
    }

    public static registry (): XtPluginRegistry {
        return XT_REGISTRY;
    }

  findComponentInfo(type: Type<XtComponent<any>>): XtComponentInfo<any>|null {
    // Search for the component registered with this class
    for (const info of this.componentRegistry.values()) {
      if (info.componentClass==type) {
        return info;
      }
    }
    return null;
  }

  getComponentInfo(type: Type<XtComponent<any>>): XtComponentInfo<any> {
    const ret= this.findComponentInfo(type);
    if (ret==null) {throw new Error ("No component found with class "+type);}
    return ret;
  }

  registerActionHandler<T>(handlerInfo:XtActionHandlerInfo<T>) {
    for (const type of handlerInfo.types) {
      const handlers = handlerInfo.actions;
      for (const actionName of Object.keys(handlers)) {
        let exist = this.actionByTypeRegistry.get(type);
        if (exist==null) {
          exist = new Map();
          this.actionByTypeRegistry.set(type, exist);
        }
        exist.set(actionName, handlers[actionName]);
      }
    }
  }

  findActionInfo<T>(type:string, actionName:string):XtActionInfo<T>|undefined {
    const handlers=this.actionByTypeRegistry.get(type);
    if (handlers!=null) {
      return handlers.get(actionName);
    }
    return undefined;
  }

  listActionInfos<T> (type:string): {name:string, info: XtActionInfo<T>}[] {
    const handlers=this.actionByTypeRegistry.get(type);
    if (handlers!=null) {
      return Array.from(handlers.entries()).map(([name,info]) => {
        return {name:name,info:info};
      });
    }
    else return []
  }
}
