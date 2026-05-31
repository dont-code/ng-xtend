import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AbstractDcWorkflow } from './abstract-dc-workflow';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { ManagedData } from 'xt-type';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { StoreTestBed } from 'xt-store';

describe('Abstract DC Workflow', () => {

  let resolverService:XtResolverService;
  let storeTestBed = new StoreTestBed();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleTestWorkflow],
      providers: [provideZonelessChangeDetection()]
    })
      .compileComponents();

    StoreTestBed.ensureMemoryProviderOnly();
    resolverService = TestBed.inject(XtResolverService);

  });


  it('should instantiate', async () => {

    resolverService.registerTypes({
      simpleTestWorkflow: {
        name: 'string',
        time: 'date'
      }
    });

    const today = new Date();
    // Generate some data
    await storeTestBed.defineTestDataFor('simpleTestWorkflow', [
      {
        name: 'R',
        time: new Date(today.getTime()-1000*60*60*24*3) // Remove 3 days
      },
      {
        name: 'Y',
        time: new Date(today.getTime()+1000*60*60*24*3) // Add 3 days
      },
      {
        name: 'A',
        time: new Date()
      }
    ])

    const fixture = TestBed.createComponent(SimpleTestWorkflow<SimpleTestWorkflowType>);
    fixture.componentRef.setInput('config', {
      entity:'simpleTestWorkflow', workflow:'list-detail', data: {
      sort:{
        name:'ascending'
      }}
    } as DcWorkflowModel);
    fixture.componentRef.setInput('context', new XtBaseContext('FULL_VIEW'));

    const component = fixture.componentInstance;
    await component.fetchValues();
    fixture.detectChanges();

    expect(component.peekValues().map(val=> val.name)).toEqual(['A','R','Y']);

    // Now we add filtering
    fixture.componentRef.setInput('config', {
      entity:'simpleTestWorkflow', workflow:'list-detail', data: {
        sort:{
          name:'ascending'
        }},
      display: {
        fields: {
          time: 'current-and-after'
        }
      }
    } as DcWorkflowModel);

    fixture.detectChanges();
    expect(component.peekValues().map(val=> val.name)).toEqual(['A','Y']);

    // Now we test filtering works with the sort
    fixture.componentRef.setInput('config', {
      entity:'simpleTestWorkflow', workflow:'list-detail', data: {
        sort:{
          time:'ascending'
        }},
      display: {
        fields: {
          time: 'current-and-after'
        }
      }
    } as DcWorkflowModel);

    await component.addValue ({
      name:'G',
      time: new Date(today.getTime()-1000*60*60*24*6) // Remove 6 days
    });
    await component.addValue ({
      name:'U',
      time: new Date(today.getTime()+1000*60*60*24*6) // Add 6 days
    });

    fixture.detectChanges();
    expect(component.peekValues().map(val=> val.name)).toEqual(['A','Y', 'U']);

    // Now we test filtering works with the sort in the other direction
    fixture.componentRef.setInput('config', {
      entity:'simpleTestWorkflow', workflow:'list-detail', data: {
        sort:{
          time:'descending'
        }},
      display: {
        fields: {
          time: 'current-and-after'
        }
      }
    } as DcWorkflowModel);

    fixture.detectChanges();
    expect(component.peekValues().map(val=> val.name)).toEqual(['U', 'Y', 'A']);

  });

});

class SimpleTestWorkflow<T extends ManagedData> extends AbstractDcWorkflow<T> {

  fetchValues (): Promise<void> {
    return this.safeFindStore().fetchEntities();
  }

  peekValues(): T[] {
    return this.displayableElements();
  }

  addValue(value:T):Promise<T> {
    return this.safeFindStore().storeEntity(value);
  }
}

type SimpleTestWorkflowType = ManagedData & {
  name:string,
  time:Date
};
