import { InjectionToken } from "@angular/core";
import { XtResolver } from "../resolver/xt-resolver";
import { XT_REGISTRY, XtPluginRegistry } from "../registry/xt-plugin-registry";
import { XtTypeResolver } from "../type/xt-type-resolver";

export const XT_RESOLVER_TOKEN = new InjectionToken<XtResolver> ('Enable providing a custom component resolver.');

export const XT_TYPE_RESOLVER_TOKEN = new InjectionToken<XtTypeResolver<any>> ('Enable providing a custom type resolver.');

export const XT_REGISTRY_TOKEN = new InjectionToken<XtPluginRegistry> ("Injects the Plugin Registry right into your angular component", 
    {
      factory: () => {
        return XT_REGISTRY;
      }
    }
  )