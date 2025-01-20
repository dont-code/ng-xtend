import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { XtResolverService } from './xt-resolver.service';
import { XtBaseContext } from '../xt-context';
import { expect } from '@jest/globals';

describe('XtResolverService', () => {
  let service: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
      .compileComponents();

    service = TestBed.inject(XtResolverService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it ('should list subNames based on value', () => {
    const result =service.listSubNamesOf(new XtBaseContext('FULL_VIEW'), {
      subName1: {},
      subName2: 'test'
    });

    expect(result).toEqual(['subName1', 'subName2']);
  });

  it ('should list subNames based on type', () => {
    service.registerPlugin({
      name: 'resolverTest',
      types: {
        type1: {
          subType1: 'string',
        },
        type2: {
          subType2: 'type1',
          subType21: 'string'
        }
      }
    });
    const baseContext = new XtBaseContext('FULL_VIEW');
    baseContext.valueType = 'type2';
    const result =service.listSubNamesOf(baseContext, null);

    expect(result).toEqual(['subType2', 'subType21']);
  });
});

