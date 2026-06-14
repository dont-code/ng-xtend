import { XtContext } from "../xt-context";
import { XtResolvedComponent } from "../xt-resolved-component";

/** Interface for component resolvers that find the best component to render for a given context */
export type XtResolver = {
    resolve<T> (baseContext:XtContext<T>, subName?:string):XtResolvedComponent|null;
}