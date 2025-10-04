import { IStoreProvider, XtActionHandler, XtActionResult, XtContext } from 'xt-components';
import { ManagedDataHandler } from 'xt-type';
import { nextDate, RecurringTask } from './recurring-task';

export class RecurringTaskHandler<T extends RecurringTask> extends ManagedDataHandler<T> implements XtActionHandler<T> {

  async runAction(context: XtContext<T>, actionName: string, store?: IStoreProvider<T> | undefined): Promise<XtActionResult<T>> {
      switch (actionName) {
        case 'next-task':
          return await this.nextTaskAction(context, store);
        default:
          return Promise.reject({ status: 'error', errors: ['Unrecognized action '+actionName] });
      }
  }

  async nextTaskAction(context: XtContext<T>, store?: IStoreProvider<T> | undefined): Promise<XtActionResult<T>> {
    const currentTask = context.value();
    if (currentTask!=null) {
      const nextTask = structuredClone(currentTask);
      nextTask.completed=false;
      nextTask.date=nextDate(currentTask);
      delete nextTask._id;
      if (store!=null) {
        if( context.valueType!=null) {
          try {
            const stored=await store.storeEntity(context.valueType,nextTask);
            return { status: 'success', value: stored };
            } catch(err) {
            return { status:'error', errors:[(err as any).toString()] };
          }
        } else {
          throw new Error ('Cannot create next recurring task for '+currentTask+', as the context '+context.toString()+' has no type defined.');
        }
      } else {
        return {status:'success', value:nextTask};
      }
    } else {
      throw new Error ('Cannot create next recurring task for a null task.');
    }
  }
}
