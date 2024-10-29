import { XtPluginRegistry } from "../registry/xt-plugin-registry";
import { XtTypeResolver } from "../type/xt-type-resolver";
import { XtContext } from "../xt-context";
import { XtResolvedComponent } from "../xt-resolved-component";
import { XtResolver } from "./xt-resolver";

export class XtRegistryResolver implements XtResolver {

    registry:XtPluginRegistry;
    typeResolver: XtTypeResolver<any>;

    constructor (registry:XtPluginRegistry, typeResolver:XtTypeResolver<any>) {
        this.registry = registry;
        this.typeResolver = typeResolver;
    }

    resolve<T>(baseContext: XtContext<T>, subName?:string): XtResolvedComponent | null {
        const context = baseContext.subContext (subName, this.typeResolver);

        const ret= this.registry.findComponentsForType (this.typeResolver.findType(context, subName), context.value());
        if (ret!=null && ret.length>0) {
            return ret[0];
        }
        return null;
    }
    
}