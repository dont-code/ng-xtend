import { XtComponentInfo, XtPluginInfo } from "../plugin/xt-plugin-info";
import { signal } from '@angular/core';

export class XtPluginRegistry {

    pluginRegistry = new Map<string, XtPluginInfo> ();
    componentRegistry = new Map<string, XtComponentInfo<any>> ();
    componentByTypeCache = new Map<string, XtComponentInfo<any>[]> ();

    listComponents = signal(new Array<XtComponentInfo<any>>());

    public static readonly ANY_TYPE="ANY";

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
        if (valueType == null) valueType=XtPluginRegistry.ANY_TYPE;

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
