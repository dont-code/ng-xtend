import { XtContext } from '../xt-context';
import { XtResolverService } from '../angular/xt-resolver.service';

export type XtActionResult<Type> = {
  status: 'success' | 'error' | 'none';
  warnings?: string[];
  errors?: string[];

  value?: Type | null;
}

export type XtActionHandler<Type> = {

  /**
   * Runs an action on a item under the context
   * @param context
   * @param actionName
   * @param store
   */
  runAction (context: XtContext<Type>, actionName: string, resolver:XtResolverService, storeMgr?:any): Promise<XtActionResult<Type>>;
}
