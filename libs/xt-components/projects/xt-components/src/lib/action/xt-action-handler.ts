import { XtContext } from '../xt-context';
import { IStoreProvider} from '../store/store-support';
import { XtResolver } from '../resolver/xt-resolver';
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
  runAction (context: XtContext<Type>, actionName: string, resolver:XtResolverService, store?:IStoreProvider<Type>): Promise<XtActionResult<Type>>;
}
