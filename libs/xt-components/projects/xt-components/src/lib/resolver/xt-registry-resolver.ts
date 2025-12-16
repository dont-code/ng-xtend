import { XtPluginRegistry } from "../registry/xt-plugin-registry";
import { isTypeReference, XtTypeResolver } from "xt-type";
import { XtContext } from "../xt-context";
import { XtResolvedComponent } from "../xt-resolved-component";
import { XtResolver } from "./xt-resolver";

export class XtRegistryResolver implements XtResolver {

    registry:XtPluginRegistry;
    typeResolver: XtTypeResolver;

    constructor (registry:XtPluginRegistry, typeResolver:XtTypeResolver) {
        this.registry = registry;
        this.typeResolver = typeResolver;
    }

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
