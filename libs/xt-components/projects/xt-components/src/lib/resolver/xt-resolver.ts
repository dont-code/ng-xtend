import { XtContext } from "../xt-context";
import { XtResolvedComponent } from "../xt-resolved-component";

export type XtResolver = {
    resolve<T> (baseContext:XtContext<T>, subName?:string):XtResolvedComponent|null;
}