import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { RecurringTaskHandler } from './recurring-task-handler';
import { StoreSupport, StoreTestHelper, XtBaseContext, XtResolverService } from 'xt-components';
import { registerAgendaPlugin } from '../register';
import { RecurringTask } from './recurring-task';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

describe('Recurring Task Handler', () => {

  beforeAll(() => {
    StoreTestHelper.ensureTestProviderOnly();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: []
    })
      .compileComponents();

    const resolver = TestBed.inject(XtResolverService);
    registerAgendaPlugin(resolver);
  });

  it ('Should calculate next task', async ()=> {
    const resolver = TestBed.inject(XtResolverService);
    const taskContext= new XtBaseContext<RecurringTask>('FULL_VIEW');
    taskContext.valueType='recurring-task';
    taskContext.setDisplayValue({
      _id:'23243',
      name:'Test Task',
      date: new Date(2025,0,1),
      completed:false,
      occurs: {
        every: 2,
        item:'Week'
      }
    });

    const handlerResult = resolver.findTypeHandlerOf(taskContext);
    expect(handlerResult).toBeDefined();
    expect(handlerResult.typeName).toBe ('recurring-task');
    expect(handlerResult.handler).toBeDefined();

    const handler = handlerResult.handler as RecurringTaskHandler<RecurringTask>;
    const nextTaskResult = await handler.runAction(taskContext, 'next-task');
    expect(nextTaskResult.status).toBe ('success');
    expect(nextTaskResult.value).toEqual({
      name:'Test Task',
      completed:false,
      occurs: {
        every: 2,
        item: 'Week'
      },
      date: new Date (2025,0,15)
    });
  });

  it ('Should calculate and store next task', async ()=> {
    const store = StoreSupport.getStoreManager().getProviderSafe<RecurringTask>('recurring-task');
    const currentTask = await store.storeEntity('recurring-task', {
      name:'Test Task',
      date: new Date(2025,0,5),
      completed:false,
      occurs: {
        every: 3,
        item:'Month'
      }
    });

    expect(currentTask._id).toBeDefined();

    const resolver = TestBed.inject(XtResolverService);
    const taskContext= new XtBaseContext<RecurringTask>('FULL_VIEW');
    taskContext.valueType='recurring-task';
    taskContext.setDisplayValue(currentTask);

    const handler = resolver.findTypeHandlerOf(taskContext).handler as RecurringTaskHandler<RecurringTask>;
    const nextTaskResult = await handler.nextTaskAction(taskContext, store);
    expect(nextTaskResult.status).toBe ('success');
    expect(nextTaskResult.value?._id).toBeDefined();
    expect(nextTaskResult.value?._id).not.toEqual(currentTask._id);

    expect(nextTaskResult.value).toEqual({
      _id:nextTaskResult.value?._id,
      name:'Test Task',
      completed:false,
      occurs: {
        every: 3,
        item: 'Month'
      },
      date: new Date (2025,3,5)
    });

    // Finds the next task in the store
    const listStored = await firstValueFrom(store.searchEntities('recurring-task'));
    expect(listStored.length).toEqual(2);

  });

});
