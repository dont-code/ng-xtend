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
        case 'remove-next-task':
          return await this.removeNextTaskAction(context, resolver, storeMgr);
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
      // We copy the underlying parent without knowing its type
      const nextTask = resolver.safeDuplicate<T>(parentContext, parentTask);
      const nextAsTask = taskMapping.to(nextTask);
      if (nextAsTask == null) {
        return Promise.reject('Duplicate task is not mappable to Task');
      }
      // Make any modification to the task
      nextAsTask.completed = false;
      nextAsTask.date = addInterval(parentAsTask.date, parentAsTask.repetition.occurs);
      // And apply the task modifications to it
      taskMapping.from(nextAsTask, nextTask);

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

  /**
   * Try to find and remove any task after the current one
   * @param context
   * @param resolver
   * @param storeMgr
   */
  async removeNextTaskAction<T extends ManagedData>(context: XtContext<boolean>, resolver: XtResolverService, storeMgr?:XtStoreManagerService): Promise<XtActionResult<number>> {
    // Lets pickup the parent item, that's the task we need to duplicate
    const parentContext = context.parentContext;
    if (parentContext == null) {
      return Promise.reject('Cannot find task in null or undefined parent element.');
    } else if (parentContext.valueType == null) {
      return Promise.reject('Cannot handle task with no defined type.');
    }

    // We'll need a store to find the task
    const store = storeMgr?.getStoreFor<T>(parentContext.valueType);
    if (store != null) {

        // We don't know the type of the parent, so we have to map it to a task and use it through the mapping
      const parentTask = parentContext.value();
      if (parentTask != null) {
        const warnings = [];
        // Can we consider the parent type as a task ?
        const taskMapping = resolver.resolveMappingOf<T, Task>(parentContext, 'task');
        if (taskMapping == null) {
          return Promise.reject('Type ' + parentContext.valueType + ' cannot be mapped to Task');
        }
        // Yes then convert it to a task
        const parentAsTask = taskMapping.to(parentTask)!;
        if (parentAsTask?.repetition.occurs == null) {
          return { status: 'none', warnings: ['No repetition defined for Task'], value:0 };
        }

        // Find the next tasks with the same repetition
        const allTasks = store?.entities();
        let countDeleted=0;
        for (const task of allTasks) {
          const mappedTask = taskMapping.to(task);
          if (mappedTask!=null) {
              // Search task with the same repetition
            if (parentAsTask?.repetition.name == mappedTask?.repetition.name) {
              if (parentAsTask?.date.getTime() < mappedTask.date.getTime()) {
                if (task._id!=null) {
                  const result = await store.deleteEntity(task._id);
                  if (!result) {
                    warnings.push("Cannot delete future task " + task._id);
                  } else {
                    countDeleted++;
                  }
                }
              }
            }
          }
        }
        return { status: 'success', warnings: ['Future tasks removed'], value:countDeleted}

      } else {
        return Promise.reject('Cannot find the parent task to duplicate.');
      }
    } else {
      // Not store exist, so nothing to do
      return { status: 'none', warnings: ['No store defined for the task to remove'], value:0}
    }
  }

  override createNew(): boolean {
    return false;
  }
}
