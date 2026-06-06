import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { effect, provideZonelessChangeDetection } from '@angular/core';
import { AbstractDcWorkflow } from './abstract-dc-workflow';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { ManagedData } from 'xt-type';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { StoreTestBed } from 'xt-store';
import { delay, find, firstValueFrom, lastValueFrom, map, range } from 'rxjs';

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


  it('should support sorting & filtering', async () => {

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

    component.initListUpdateWait();
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
    await component.waitForListUpdate();
    expect(component.peekValues().map(val=> val.name)).toEqual(['Y']);

    // Now we test filtering works with the sort
    component.initListUpdateWait();
    await component.addValue ({
      name:'G',
      time: new Date(today.getTime()-1000*60*60*24*6) // Remove 6 days
    });
    await component.addValue ({
      name:'U',
      time: new Date(today.getTime()+1000*60*60*24*6) // Add 6 days
    });
    fixture.detectChanges();
    await component.waitForListUpdate();
    expect(component.peekValues().map(val=> val.name)).toEqual(['U', 'Y']);

    component.initListUpdateWait();
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

    fixture.detectChanges();
/*    await component.waitFor(() => {
      const values=component.peekValues();
      return (values[0].name=='Y');
    });*/
    await component.waitForListUpdate();
    expect(component.peekValues().map(val=> val.name)).toEqual(['Y', 'U']);

    // Now we test filtering works with the sort in the other direction
    component.initListUpdateWait();
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
    await component.waitForListUpdate();
    expect(component.peekValues().map(val=> val.name)).toEqual(['U', 'Y']);

  });

});

class SimpleTestWorkflow<T extends ManagedData> extends AbstractDcWorkflow<T> {

  protected listUpdated = false;

  protected checkforListUpdated=effect(()=> {
    const list=this.displayableElements();  // Create a dependency
    this.listUpdated=true;
  });

  fetchValues (): Promise<void> {
    return this.safeFindStore().fetchEntities();
  }

  initListUpdateWait ():void {
    this.listUpdated=false;
  }

  async waitFor(test: any): Promise<void> {
      await lastValueFrom(range(0, 10).pipe(
        delay(50),
        find(() => {
          return test(this.safeFindStore().entities());
        })
      ));
  }

  async waitForListUpdate(): Promise<void> {
    if (this.listUpdated) return Promise.resolve();
    else {
      await lastValueFrom(range(0, 10).pipe(
        delay(50),
        find(() => {
          return this.listUpdated;
        })
      ));
    }
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
