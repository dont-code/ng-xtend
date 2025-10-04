import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { xtPluginRegistry } from '../../globals';
import { XtActionHandler, XtActionResult } from '../action/xt-action-handler';
import { XtContext } from '../xt-context';
import { IStoreProvider } from '../store/store-support';

describe('XtPluginRegistry', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [provideZonelessChangeDetection()]
    })
      .compileComponents();

  });

  it('should support actions', () => {
    const registry = xtPluginRegistry();
    registry.registerPlugin({
      name: 'RegistryTestPlugin',
      types: {
        'reg-test-type': {
          name: 'string',
          count: 'number'
        },
        'reg-test-other': {
          id: 'string'
        }
      },
      actionHandlers: [
        {
          types: ['reg-test-type', 'reg-test-other'],
          actions: {
            'run': {
              description: 'Yes',
              visible: true,
              handlerClass: TestRunActionHandler
            },
            'reload': {
              description: 'just do it',
              visible: false,
              handlerClass: TestReloadActionHandler
            }
          }
        }
      ]
    });
    // Now test the load was ok
    let otherActions = registry.listActionInfos('reg-test-other');
    expect(otherActions).toHaveLength(2);

    // Update the registry
    registry.registerPlugin({
      name: 'RegistryTestNewPlugin',
      actionHandlers: [
        {
          types: [ 'reg-test-other'],
          actions: {
            'run': {
              description: 'Yes',
              visible: true,
              handlerClass: TestRunActionHandler
            },
            'delete': {
              description: 'just delete',
              visible: false,
              handlerClass: TestNewActionHandler
            }
          }
        }
      ]
    });

    otherActions = registry.listActionInfos('reg-test-other');
    expect(otherActions).toHaveLength(3);
  });

});

class TestRunActionHandler implements XtActionHandler<any> {
    runAction(context: XtContext<any>, actionName: string, store?: IStoreProvider<any> | undefined): Promise<XtActionResult<any>> {
        throw new Error('Method not implemented.');
    }

}

class TestReloadActionHandler implements XtActionHandler<any> {
    runAction(context: XtContext<any>, actionName: string, store?: IStoreProvider<any> | undefined): Promise<XtActionResult<any>> {
        throw new Error('Method not implemented.');
    }

}

class TestNewActionHandler implements XtActionHandler<any> {
  runAction(context: XtContext<any>, actionName: string, store?: IStoreProvider<any> | undefined): Promise<XtActionResult<any>> {
    throw new Error('Method not implemented.');
  }

}
