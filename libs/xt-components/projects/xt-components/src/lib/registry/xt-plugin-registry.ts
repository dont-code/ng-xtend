import { XtComponentInfo, XtPluginInfo } from "../plugin/xt-plugin-info";
import { signal } from '@angular/core';

export class XtPluginRegistry {

    pluginRegistry = new Map<string, XtPluginInfo> ();
    componentRegistry = new Map<string, XtComponentInfo<any>> ();
    componentByTypeCache = new Map<string, XtComponentInfo<any>[]> ();

    listComponents = signal(new Array<XtComponentInfo<any>>());

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
      //console.debug('Finding type from '+valueType+' with value ',value);
        // We don't know the value type, let's try to guess if it's a primitive or object based on the value
        if (valueType == null) {
          valueType = XtPluginRegistry.ANY_OBJECT_TYPE;
          if ((value == null) || (typeof value != 'object')) {
            valueType=XtPluginRegistry.ANY_PRIMITIVE_TYPE;
          } else if (value instanceof Date) {
            valueType=XtPluginRegistry.ANY_PRIMITIVE_TYPE;
          }

          if (Array.isArray(value)) {
            valueType = (valueType===XtPluginRegistry.ANY_PRIMITIVE_TYPE)?XtPluginRegistry.ANY_PRIMITIVE_SET:XtPluginRegistry.ANY_OBJECT_SET;
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
            this.componentByTypeCache.set (valueType, ret);
        }
        return ret;
    }

    public static registry (): XtPluginRegistry {
        return XT_REGISTRY;
    }
}

export const XT_REGISTRY=new XtPluginRegistry ();
