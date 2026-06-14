import { XtContext } from '../xt-context';
import { XtResolverService } from '../angular/xt-resolver.service';

/** Result of executing an action on an item */
export type XtActionResult<Type> = {
  status: 'success' | 'error' | 'none';
  warnings?: string[];
  errors?: string[];

  value?: Type | null;
}

/** Defines an action handler that can run actions on items under a given context */
export type XtActionHandler<Type> = {

  /**
   * Runs an action on a item under the context
   * @param context
   * @param actionName
   * @param resolver
   * @param storeMgr
   */
  runAction (context: XtContext<Type>, actionName: string, resolver:XtResolverService, storeMgr?:any): Promise<XtActionResult<Type>>;
}
