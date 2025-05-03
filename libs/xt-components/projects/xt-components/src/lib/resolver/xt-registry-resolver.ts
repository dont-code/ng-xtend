import { XtPluginRegistry } from "../registry/xt-plugin-registry";
import { XtTypeResolver } from "xt-type";
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
        const ret= this.registry.findComponentsForType (this.typeResolver.findTypeName(baseContext.valueType, subName), baseContext.subValue(subName));
        if (ret!=null && ret.length>0) {
            return XtResolvedComponent.from( ret[0]);
        }
        return null;
    }

}
