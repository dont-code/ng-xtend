import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TaskCompleteHandler } from './task-complete-handler';
import { StoreSupport, StoreTestHelper, XtBaseContext, XtResolverService } from 'xt-components';
import { registerAgendaPlugin } from '../register';
import { RecurringTask } from './recurring-task';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

describe('Recurring Task Handler', () => {

  let resolver:XtResolverService;

  beforeAll(() => {
    StoreTestHelper.ensureTestProviderOnly();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: []
    })
      .compileComponents();

    resolver = TestBed.inject(XtResolverService);
    registerAgendaPlugin(resolver);
  });

  it ('Should calculate next task', async ()=> {
    resolver.registerTypes({
      'testing-task': {
        date: 'date',
        repeat: 'recurring-task',
        completed: 'task-complete'
      }
    });
    const taskContext= new XtBaseContext<any>('FULL_VIEW');
    taskContext.valueType='testing-task';
    taskContext.setDisplayValue({
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

    const completedContext = taskContext.subContext('completed', undefined, resolver.typeResolver);
    expect(completedContext.valueType).toBe ('task-complete');

    const nextTaskResult = await resolver.runAction(completedContext, 'next-task');
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
    resolver.registerTypes({
      'testing-task': {
        date: 'date',
        repeat: 'recurring-task',
        completed: 'task-complete'
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

    const taskContext= new XtBaseContext<TestingTask>('FULL_VIEW');
    taskContext.valueType='testing-task';
    taskContext.setDisplayValue(currentTask);

    const completedContext = taskContext.subContext('completed', undefined, resolver.typeResolver);
    expect(completedContext.valueType).toBe ('task-complete');

    const nextTaskResult = await resolver.runAction(completedContext, 'next-task', store);
    expect(nextTaskResult.status).toBe ('success');
    expect(nextTaskResult.value?._id).toBeDefined();
    expect(nextTaskResult.value?._id).not.toEqual(currentTask._id);

    expect(nextTaskResult.value).toEqual({
      _id:nextTaskResult.value?._id,
      completed:false,
      repeat: {
        name:'Test Task 2',
        occurs: {
          every: 3,
          item: 'Month'
        }
      },
      date: new Date (2025,3,5)
    });

    // Finds the next task in the store
    const listStored = await firstValueFrom(store.searchEntities('testing-task'));
    expect(listStored.length).toEqual(2);

  });

});

type TestingTask = {
  _id?:string,
  date:Date,
  completed:boolean,
  repeat: RecurringTask
}
