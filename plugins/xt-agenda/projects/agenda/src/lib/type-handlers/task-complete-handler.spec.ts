import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { StoreTestHelper, XtBaseContext, XtResolverService } from 'xt-components';
import { registerAgendaPlugin } from '../register';
import { RecurringTask } from './recurring-task';
import { TestBed } from '@angular/core/testing';
import { StoreTestBed, XtStoreManagerService } from 'xt-store';

describe('Recurring Task Handler', () => {

  let resolver:XtResolverService;
  let storeMgr: XtStoreManagerService;

  beforeAll(() => {
    StoreTestHelper.ensureTestProviderOnly();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: []
    })
      .compileComponents();

    resolver = TestBed.inject(XtResolverService);
    storeMgr = TestBed.inject(XtStoreManagerService);
    resolver.registerTypes({ image: 'string'});
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
    StoreTestBed.ensureMemoryProviderOnly();
    resolver.registerTypes({
      'testing-task': {
        date: 'date',
        repeat: 'recurring-task',
        completed: 'task-complete'
      }
    });
    const store = storeMgr.getStoreFor<TestingTask>('testing-task');
    const currentTask = await store.storeEntity({
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

    const nextTaskResult = await resolver.runAction(completedContext, 'next-task', storeMgr);
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
    expect(store.entities().length).toEqual(2);

  });

  it ('Should properly remove next tasks', async ()=> {
    StoreTestBed.ensureMemoryProviderOnly();
    resolver.registerTypes({
      'other-testing-task': {
        fixed: 'date',
        repetition: 'recurring-task',
        finished: 'task-complete'
      }
    });
    const store = storeMgr.getStoreFor<OtherTestingTask>('other-testing-task');
    // Create 3 tasks of the same recurrence
    const currentTask = await store.storeEntity({
      fixed: new Date(2025,0,5),
      finished:true,
      repetition: {
        name: 'Other Test Task',
        occurs: {
          every: 1,
          item: 'Month'
        }
      }
    });
    const nextTask = await store.storeEntity({
      fixed: new Date(2025,1,5),
      finished:false,
      repetition: {
        name: 'Other Test Task',
        occurs: {
          every: 1,
          item: 'Month'
        }
      }
    });
    const nextNextTask = await store.storeEntity({
      fixed: new Date(2025,2,5),
      finished:false,
      repetition: {
        name: 'Other Test Task',
        occurs: {
          every: 1,
          item: 'Month'
        }
      }
    });

    expect(currentTask._id).toBeDefined();
    expect(nextTask._id).toBeDefined();
    expect(nextNextTask._id).toBeDefined();

    const taskContext= new XtBaseContext<OtherTestingTask>('FULL_VIEW');
    taskContext.valueType='other-testing-task';
    taskContext.setDisplayValue(currentTask);

    const completedContext = taskContext.subContext('finished', undefined, resolver.typeResolver);
    expect(completedContext.valueType).toBe ('task-complete');

    const nextTaskResult = await resolver.runAction(completedContext, 'remove-next-task', storeMgr);
    expect(nextTaskResult.status).toBe ('success');
    expect(nextTaskResult.value).toEqual(2);

    // Ensure they got removed from the store
    expect(store.entities().length).toEqual(1);

  });

});

type TestingTask = {
  _id?:string,
  date:Date,
  completed:boolean,
  repeat: RecurringTask
}

type OtherTestingTask = {
  _id?:string,
  fixed: Date,
  repetition: RecurringTask,
  finished: boolean
}
