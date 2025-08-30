import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { XtResolverService } from './xt-resolver.service';
import { XtBaseContext } from '../xt-context';
import { AbstractTypeHandler, XtTypeHierarchy } from 'xt-type';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('XtResolverService', () => {
  let service: XtResolverService;

  beforeAll( () => {
    setupAngularTestBed();
  });

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
