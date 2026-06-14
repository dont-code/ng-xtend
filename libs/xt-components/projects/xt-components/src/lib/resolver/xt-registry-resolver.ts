import { XtPluginRegistry } from "../registry/xt-plugin-registry";
import { isTypeReference, XtTypeResolver } from "xt-type";
import { XtContext } from "../xt-context";
import { XtResolvedComponent } from "../xt-resolved-component";
import { XtResolver } from "./xt-resolver";

/** Resolves components by looking them up in the plugin registry based on context type */
export class XtRegistryResolver implements XtResolver {

    /** The plugin registry to search in */
    registry:XtPluginRegistry;
    /** The type resolver for type hierarchy lookups */
    typeResolver: XtTypeResolver;

    /**
     * Creates a new XtRegistryResolver
     * @param registry - The plugin registry to use for component lookups
     * @param typeResolver - The type resolver for type hierarchy information
     */
    constructor (registry:XtPluginRegistry, typeResolver:XtTypeResolver) {
        this.registry = registry;
        this.typeResolver = typeResolver;
    }

    /**
     * Resolves a component for the given context and optional subName
     * @param baseContext - The context containing type and value information
     * @param subName - Optional sub-name for nested property resolution
     * @returns The resolved component info or null if no component matches
     */
    resolve<T>(baseContext: XtContext<T>, subName?:string): XtResolvedComponent | null {
      let typeToFind = baseContext.valueType;

      const typeInfo = this.typeResolver.findType(baseContext.valueType, subName);
        // If it's a type reference, we find the component of the referenced type
      if (isTypeReference(typeInfo)) {
        if (baseContext.displayMode=='FULL_EDITABLE') {
          typeToFind = XtPluginRegistry.ANY_SINGLE_REFERENCE;
        }else {
          typeToFind =typeInfo.toType;
        }
      }

      const ret= this.registry.findComponentsForType (typeToFind, baseContext.subValue(subName));
        if (ret!=null && ret.length>0) {
            return XtResolvedComponent.from( ret[0]);
        }
        return null;
    }

}
