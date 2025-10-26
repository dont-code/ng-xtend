import { XtActionHandler, XtActionResult, XtContext, XtResolverService } from 'xt-components';
import { AbstractTypeHandler, ManagedData } from 'xt-type';
import { Task } from './recurring-task';
import { addInterval } from './date-interval';
import { XtStoreManagerService } from 'xt-store';

export class TaskCompleteHandler extends AbstractTypeHandler<any> implements XtActionHandler<any> {

  async runAction(context: XtContext<any>, actionName: string, resolver:XtResolverService, storeMgr?:XtStoreManagerService): Promise<XtActionResult<any>> {
      switch (actionName) {
        case 'next-task':
          return await this.nextTaskAction(context, resolver, storeMgr);
        default:
          return Promise.reject({ status: 'error', errors: ['Unrecognized action '+actionName] });
      }
  }

  /**
   * Let's create the next iteration of the task that holds the recurrent task complete button
   * @param context
   * @param resolver
   * @param storeMgr
   */
  async nextTaskAction<T extends ManagedData>(context: XtContext<boolean>, resolver: XtResolverService, storeMgr?:XtStoreManagerService): Promise<XtActionResult<T>> {
    // Lets pickup the parent item, that's the task we need to duplicate
    const parentContext = context.parentContext;
    if (parentContext == null) {
      return Promise.reject('Cannot duplicate null or undefined parent element.');
    } else if (parentContext.valueType == null) {
      return Promise.reject('Cannot handle task with no defined type.');
    }

    // We don't know the type of the parent, so we have to map it to a task and use it through the mapping
    const parentTask = parentContext.value();
    if (parentTask != null) {
        // Can we consider the parent type as a task ?
      const taskMapping = resolver.resolveMappingOf<T, Task>(parentContext, 'task');
      if (taskMapping == null) {
        return Promise.reject('Type ' + parentContext.valueType + ' cannot be mapped to Task');
      }
      // Yes then convert it to a task
      const parentAsTask = taskMapping.to(parentTask)!;
      if (parentAsTask?.repetition.occurs == null) {
        return {status: 'none', warnings:['No repetition defined for Task']};
      }
      // Make any modification to the task
      parentAsTask.completed = false;
      parentAsTask.date = addInterval(parentAsTask.date, parentAsTask.repetition.occurs);
      // We copy the underlying parent without knowing its type
      const nextTask = resolver.safeDuplicate(parentContext, parentTask);
      // And apply the task modifications to it
      taskMapping.from(parentAsTask, nextTask);

        // Let's try to store the newly created item
      const store = storeMgr?.getStoreFor<T>(parentContext.valueType);
      if (store != null) {
        try {
          const stored = await store.storeEntity(nextTask);
          return { status: 'success', value: stored };
        } catch (err) {
          return { status: 'error', errors: [(err as any).toString()] };
        }
      } else {
        return { status: 'success', value: nextTask };
      }
    } else {
      return Promise.reject('Cannot find the parent task to duplicate.');
    }
  }

  override createNew(): boolean {
    return false;
  }
}
