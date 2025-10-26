import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { XtResolverService } from './xt-resolver.service';
import { XtBaseContext, XtContext } from '../xt-context';
import { AbstractTypeHandler, XtTypeHierarchy } from 'xt-type';
import { beforeEach, describe, expect, it } from 'vitest';
import { XtActionHandler, XtActionResult } from '../action/xt-action-handler';
import { IStoreProvider } from '../store/store-support';

describe('XtResolverService', () => {
  let service: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [provideZonelessChangeDetection()]
    })
      .compileComponents();

    service = TestBed.inject(XtResolverService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should list subNames based on value', () => {
    const result = service.listSubNamesOf(new XtBaseContext('FULL_VIEW'), {
      subName1: {},
      subName2: 'test'
    });

    expect(result).toEqual(['subName1', 'subName2']);
  });

  it('should list subNames based on type', () => {
    service.registerPlugin({
      name: 'resolverTest',
      types: {
        type1: {
          subType1: 'string'
        },
        type2: {
          subType2: 'type1',
          subType21: 'string'
        }
      }
    });
    const baseContext = new XtBaseContext('FULL_VIEW');
    baseContext.valueType = 'type2';
    const result = service.listSubNamesOf(baseContext, null);

    expect(result).toEqual(['subType2', 'subType21']);
  });

  it('should properly set typeHandlers', () => {
    service.registerPlugin({
      name: 'resolverTest',
      types: {
        type1: {
          subType1: 'testString'
        },
        type2: {
          subType2: 'testType2',
          subType21: 'testString'
        }
      },
      typeHandlers: [
        {
          typesHandled: ['type1', 'testString'],
          handlerClass: TestTypeHandler
        },
        {
          typesHandled: ['type2', 'testType2'],
          handlerClass: TestType2Handler
        }
      ]
    });

    const baseContext = new XtBaseContext('FULL_VIEW');
    baseContext.valueType = 'type2';
    const ret = service.findTypeHandlerOf(baseContext, undefined, null);
    expect(ret?.handler).toBeTruthy();
  });

  it('should properly register actionhandlers', async () => {
    service.registerPlugin({
      name: 'ActionTestPlugin',
      types: {
        'action-test-complete': 'boolean',
        'action-test-task': {
          name: 'string',
          count: 'number',
          complete: 'action-test-complete'
        }
      },
      actionHandlers: [
        {
          types: ['action-test-task'],
          actions: {
            'complete-task': {
              description: 'Complete the task and create the next one',
              visible: true,
              handlerClass: TestTaskCompleteActionHandler
            }
          }
        }
      ]
    });

      // Check we can run an action
    const context = new XtBaseContext<{name:string, count:number, complete:boolean}>('FULL_VIEW');
    context.setDisplayValue({
      name: 'test task',
      count: 0,
      complete: false
    }, 'action-test-task');

    const actions = service.possibleActions(context, false);
    expect(actions).toHaveLength(1);
    expect(actions[0].name).toEqual('complete-task');

    const actionRun = await service.runAction(context, 'complete-task');

    expect(actionRun.status).toBe('success');
    expect(context.displayValue()?.complete).toBeTruthy();

    // Check an action run works in parent context
    context.setDisplayValue({
      name: 'test task',
      count: 1,
      complete: false
    });
    const subContext=context.subContext('complete', 'action-test-complete');
    const subActionRun = await service.runAction(subContext,'complete-task');

    expect(subActionRun.status).toBe('success');
    expect(context.displayValue()?.complete).toBeTruthy();
  });
});

class TestTypeHandler extends AbstractTypeHandler<any> {
    override createNew() {
        return {};
    }
    override init(context: XtTypeHierarchy): void {

    }

}
class TestType2Handler extends AbstractTypeHandler<any> {
    override createNew() {
        return {};
    }
    override init(context: XtTypeHierarchy): void {

    }

}


class TestTaskCompleteActionHandler implements XtActionHandler<any> {
  runAction(context: XtContext<any>, actionName: string, resolver:XtResolverService, storeMgr?:any): Promise<XtActionResult<any>> {
    const val = context.displayValue ();
    val.complete = true;
    context.setDisplayValue(val);
    return Promise.resolve({
      status: 'success',
      value:val
    });
  }

}

class TestReloadActionHandler implements XtActionHandler<any> {
  runAction(context: XtContext<any>, actionName: string, resolver:XtResolverService, storeMgr?:any): Promise<XtActionResult<any>> {
    throw new Error('Method not implemented.');
  }

}

class TestNewActionHandler implements XtActionHandler<any> {
  runAction(context: XtContext<any>, actionName: string, resolver:XtResolverService, storeMgr?:any): Promise<XtActionResult<any>> {
    throw new Error('Method not implemented.');
  }

}

