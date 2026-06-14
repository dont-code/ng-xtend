import { InjectionToken } from "@angular/core";
import { XtResolver } from "../resolver/xt-resolver";
import { XtPluginRegistry } from "../registry/xt-plugin-registry";
import { XtTypeResolver } from "xt-type";
import { xtPluginRegistry } from '../../globals';

/** Injection token for providing a custom component resolver */
export const XT_RESOLVER_TOKEN = new InjectionToken<XtResolver> ('Enable providing a custom component resolver.');

/** Injection token for providing a custom type resolver */
export const XT_TYPE_RESOLVER_TOKEN = new InjectionToken<XtTypeResolver> ('Enable providing a custom type resolver.');

/** Injection token for providing the plugin registry with a default factory */
export const XT_REGISTRY_TOKEN = new InjectionToken<XtPluginRegistry> ("Injects the Plugin Registry right into your angular component",
    {
      factory: () => {
        return xtPluginRegistry();
      }
    }
  )
