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
    resolver.registerTypes({
      'testing-task': {
        date: 'date',
        repeat: 'recurring-task',
        completed: 'recurring-task-complete'
      }
    });
    const taskContext= new XtBaseContext<any>('FULL_VIEW');
    taskContext.valueType='testing-task';
    taskContext.setDisplayValue({
      _id:'23243',
      date: new Date(2025,0,1),
      completed:false,
      repeat:{
        name:'Test Task 1',
        occurs: {
          every: 2,
          item:'Week'
        }
      }
    });

    const handlerResult = resolver.findTypeHandlerOf(taskContext);
    expect(handlerResult).toBeDefined();
    expect(handlerResult.typeName).toBe ('testing-task');
    expect(handlerResult.handler).toBeDefined();

    const handler = handlerResult.handler as RecurringTaskHandler<RecurringTask>;
    const nextTaskResult = await handler.runAction(taskContext, 'next-task');
    expect(nextTaskResult.status).toBe ('success');
    expect(nextTaskResult.value).toEqual({
      completed:false,
      repeat:{
        name: 'Test Task 1',
        occurs: {
          every: 2,
          item: 'Week'
        }
      },
      date: new Date (2025,0,15)
    });
  });

  it ('Should calculate and store next task', async ()=> {
    const resolver = TestBed.inject(XtResolverService);
    resolver.registerTypes({
      'testing-task': {
        date: 'date',
        repeat: 'recurring-task',
        completed: 'recurring-task-complete'
      }
    });
    const store = StoreSupport.getStoreManager().getProviderSafe<TestingTask>('testing-task');
    const currentTask = await store.storeEntity('testing-task', {
      date: new Date(2025,0,5),
      completed:false,
      repeat: {
        name: 'Test Task 2',
        occurs: {
          every: 3,
          item: 'Month'
        }
      }
    });

    expect(currentTask._id).toBeDefined();

    const taskContext= new XtBaseContext<RecurringTask>('FULL_VIEW');
    taskContext.valueType='recurring-task';
    taskContext.setDisplayValue(currentTask);

    const handler = resolver.findTypeHandlerOf(taskContext).handler as RecurringTaskHandler<RecurringTask>;
    expect(handler).toBeTruthy();
    const nextTaskResult = await handler.nextTaskAction(taskContext, store);
    expect(nextTaskResult.status).toBe ('success');
    expect(nextTaskResult.value?._id).toBeDefined();
    expect(nextTaskResult.value?._id).not.toEqual(currentTask._id);

    expect(nextTaskResult.value).toEqual({
      _id:nextTaskResult.value?._id,
      completed:false,
      created: {
        name:'Test Task 2',
        occurs: {
          every: 3,
          item: 'Month'
        }
      },
      date: new Date (2025,3,5)
    });

    // Finds the next task in the store
    const listStored = await firstValueFrom(store.searchEntities('recurring-task'));
    expect(listStored.length).toEqual(2);

  });

});

type TestingTask = {
  _id:string,
  date:Date,
  completed:boolean,
  repeat: RecurringTask
}
