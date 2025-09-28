import { XtContext } from '../xt-context';
import { IStoreProvider} from '../store/store-support';

export type XtActionResult<Type> = {
  status: 'success' | 'error';
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
  runAction (context: XtContext<Type>, actionName: string, store?:IStoreProvider<Type>): Promise<XtActionResult<Type>>;
}
