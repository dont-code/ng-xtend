import {
  XtActionHandlerInfo,
  XtActionInfo,
  XtComponentInfo,
  XtPluginInfo,
  XtWorkflowInfo
} from '../plugin/xt-plugin-info';
import { signal, Type } from '@angular/core';
import { XtComponent } from '../xt-component';
import { XtWorkflow } from '../workflow/xt-workflow';

/**
 * Maintain the list of plugins loaded, with their components and actions
 *
 */
export class XtPluginRegistry {

    /** Map of all registered plugins by name */
    pluginRegistry = new Map<string, XtPluginInfo> ();
    /** Map of all registered components by component name */
    componentRegistry = new Map<string, XtComponentInfo<any>> ();
    /** Cache of components found by value type */
    componentByTypeCache = new Map<string, XtComponentInfo<any>[]> ();
    /** Map of all registered workflows by name */
    protected workflowRegistry = new Map<string, XtWorkflowInfo<any>> ();
    /** Map of actions registered by type, then by action name */
    protected actionByTypeRegistry = new Map<string, Map<string, XtActionInfo<any>>> ();

    /** Signal listing all registered component infos */
    listComponents = signal(new Array<XtComponentInfo<any>>());
    /** Signal listing all registered plugin infos */
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

  /** Components can manage any set of primitive types */
  public static readonly ANY_PRIMITIVE_SET = "ANY_PRIMITIVE_SET";

  /** Components can manage any set of object types */
  public static readonly ANY_OBJECT_SET = "ANY_OBJECT_SET";

  /**
   * Whenever a component can handle any type of reference to a single entity or to multiple entities.
   */
  public static readonly ANY_SINGLE_REFERENCE = "ANY_SINGLE_REFERENCE";

  /** Whenever a component can handle any type of reference to multiple entities */
  public static readonly ANY_MULTIPLE_REFERENCE = "ANY_MULTIPLE_REFERENCE";

  /**
   * Registers a plugin with its components, actions, and workflows
   * @param info - The plugin information to register
   */
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

    if (info.workflows!=null) {
      for (const wfw of info.workflows) {
        this.registerWorkflow (wfw);
      }
    }

    // Updates the signal which list all plugins
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

    /**
     * Registers a workflow component
     * @param info - The workflow information to register
     */
    registerWorkflow<T extends XtWorkflow> (info:XtWorkflowInfo<T>) {
      this.workflowRegistry.set(info.name, info);
    }

    /**
     * Registers a component in the component registry
     * @param info - The component information to register
     */
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

  /**
   * Finds components that can handle the given value type
   * @param valueType - The value type to search for, or null/undefined to infer from the value
   * @param value - The optional value to infer the type from
   * @returns An array of matching component infos
   */
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

  /**
   * Returns the global singleton plugin registry
   * @returns The global XtPluginRegistry instance
   */
  public static registry (): XtPluginRegistry {
    return XT_REGISTRY;
  }

  /**
   * Finds component info for the given component class type
   * @param type - The component class type to search for
   * @returns The component info or null if not found
   */
  findComponentInfo(type: Type<XtComponent<any>>): XtComponentInfo<any>|null {
    // Search for the component registered with this class
    for (const info of this.componentRegistry.values()) {
      if (info.componentClass==type) {
        return info;
      }
    }
    return null;
  }

  /**
   * Gets component info for the given component class type, throwing if not found
   * @param type - The component class type to search for
   * @returns The component info
   * @throws Error if no component is found with the given class
   */
  getComponentInfo(type: Type<XtComponent<any>>): XtComponentInfo<any> {
    const ret= this.findComponentInfo(type);
    if (ret==null) {throw new Error ("No component found with class "+type);}
    return ret;
  }

  /**
   * Finds all the workflow components that can handle the given workflow type
   * @param type
   */
  listWorkflowsForType (type:string): XtWorkflowInfo<any>[] {
    const ret = [] as XtWorkflowInfo<any>[];
    for (const info of this.workflowRegistry.values()) {
      const index=info.workflowsHandled.findIndex((val)=>val==type);
      if (index>=0) {
        ret.push(info);
      }
    }
    return ret;
  }

  /**
   * Finds workflow info by name
   * @param name - The workflow name to search for
   * @returns The workflow info or undefined if not found
   */
  findWorkflowInfo (name:string): XtWorkflowInfo<any>|undefined {
    return this.workflowRegistry.get(name);
  }

  /**
   * Registers action handlers grouped by type
   * @param handlerInfo - The action handler information to register
   */
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

  /**
   * Finds action info for the given type and action name
   * @param type - The type to look up
   * @param actionName - The action name to find
   * @returns The action info or undefined if not found
   */
  findActionInfo<T>(type:string, actionName:string):XtActionInfo<T>|undefined {
    const handlers=this.actionByTypeRegistry.get(type);
    if (handlers!=null) {
      return handlers.get(actionName);
    }
    return undefined;
  }

  /**
   * Lists all action infos registered for the given type
   * @param type - The type to list actions for
   * @returns An array of action name and info pairs
   */
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
