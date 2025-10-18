import { IStoreProvider, XtActionHandler, XtActionResult, XtContext, XtResolverService } from 'xt-components';
import { ManagedDataHandler } from 'xt-type';
import { RecurringTask } from './recurring-task';
import { inject } from '@angular/core';

export class RecurringTaskHandler<T> extends ManagedDataHandler<T> implements XtActionHandler<T> {
  resolver = inject(XtResolverService);

  async runAction(context: XtContext<T>, actionName: string, store?: IStoreProvider<T> | undefined): Promise<XtActionResult<T>> {
      switch (actionName) {
        case 'next-task':
          return await this.nextTaskAction(context, store);
        default:
          return Promise.reject({ status: 'error', errors: ['Unrecognized action '+actionName] });
      }
  }

  /**
   * Let's create the next iteration of the task that holds the recurrent task complete button
   * @param context
   * @param store
   */
  async nextTaskAction(context: XtContext<T>, store?: IStoreProvider<T> | undefined): Promise<XtActionResult<T>> {
    // Lets pickup the parent item, that's the one we need to duplicate
    const parentContext = context.parentContext;
    if (parentContext==null) {
      return Promise.reject('Cannot duplicate null or undefined parent element.');
    }

    const parentTask = parentContext.value();
    if (parentTask!=null) {
      // Let's find the recurring task associated with it
      const reccurence = this.resolver.findSubPropertyWithType (parentContext, 'recurring-task', parentTask) as RecurringTask;
      if (reccurence==null) {
        return Promise.reject('Cannot find recurrence info of type "recurring-task" for the element '+parentTask);
      }
      const nextTask = this.resolver.safeDuplicate (parentContext, parentTask);
      nextTask.completed=false;
      nextTask.date=nextDate(parentTask);
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
          throw new Error ('Cannot create next recurring task for '+parentTask+', as the context '+context.toString()+' has no type defined.');
        }
      } else {
        return {status:'success', value:nextTask};
      }
    } else {
      throw new Error ('Cannot create next recurring task for a null task.');
    }
  }
}
