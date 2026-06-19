import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDetailsComponent } from './list-details.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService, XtUnitTestHelper } from 'xt-components';
import { StoreTestBed } from 'xt-store';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { DcWorkflowModel } from 'dc-workflow';
import { RouterTestingHarness } from '@angular/router/testing';
import { FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';

describe('ListDetailsComponent', () => {
  let component: ListDetailsComponent<any>;
  let fixture: ComponentFixture<ListDetailsComponent<any>>;
  let storeTestBed: StoreTestBed;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDetailsComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), MessageService]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));
    storeTestBed = new StoreTestBed();
    StoreTestBed.ensureMemoryProviderOnly();
  });

  it(
    'should create', async () => {
      await storeTestBed.defineTestDataFor('TestBook', [{
        name: 'Test Book',
        published: new Date(1970,10, 5)
      }, {
        name: 'Another Book',
        published: new Date(2010,7, 15)
      }
      ]);

    fixture = TestBed.createComponent(ListDetailsComponent);
    fixture.componentRef.setInput("config", {
      entity: 'TestBook',
      workflow: 'list-detail',
      data: {
        sort: {
          'name':'ascending'
        }
      }
    } as DcWorkflowModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();

    await fixture.whenStable();
      await fixture.whenStable();
      await fixture.whenStable();
      await fixture.whenStable();
      await fixture.whenStable();
    // Ensure list is sorted accordingly
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    expect(rows).toHaveLength(2);

    expect(rows[0].nativeElement.textContent.indexOf('Another Book')).not.toEqual(-1);
    expect(rows[1].nativeElement.textContent.indexOf('Test Book')).not.toEqual(-1);
  });


  it('should support full lifecycle for simple values',async () => {
    const resolver = TestBed.inject(XtResolverService);

    resolver.registerTypes({
      "NewPrice": {
        "amount":"string",
        "currency":"string"
      },
      "NewElement": {
        "name":"string",
        "price":"NewPrice"
      }
    });

    fixture = TestBed.createComponent(ListDetailsComponent);
    fixture.componentRef.setInput("config", {
      entity: 'NewElement',
      workflow: 'list-detail',
      data: {
        sort: {
          'name':'ascending'
        }
      }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('NewElement');
    fixture.detectChanges();

    // Click on new
    //const newSpy = vi.spyOn(component, 'newEntity');
    const btnNew = fixture.debugElement.query(By.css("#btn-new"));
    btnNew.children[0].nativeElement.click();
    fixture.detectChanges();
    // For some reasons, we have to wait multiple times for stability
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();

    //expect(newSpy).toHaveBeenCalledOnce();
    const form=component.editForm().get('editor') as FormGroup;
    // Check fields
    expect(Object.keys(form.controls)).toEqual([
      '_id','name','price'
    ]);
    expect(Object.keys((form.get('price') as FormGroup).controls)).toEqual(['amount', 'currency']);

    // Now set some values in the fields
    let nameInput=fixture.debugElement.query(By.css('[name="name"]'));
    nameInput.nativeElement.value='NewName';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const amountInput = fixture.debugElement.query(By.css('[name="amount"]'));
    amountInput.nativeElement.value='12';
    amountInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(form.value).toEqual({
      _id:component.selectedEntity()!._id,
      name:'NewName',
      price: {
        amount:"12",
        currency:null
      }
    });

    //Click on save
    //const saveSpy = vi.spyOn(component, 'save');
    const btnSave = fixture.debugElement.query(By.css("#btn-save"));
    btnSave.children[0].nativeElement.click();
    fixture.detectChanges();

    await XtUnitTestHelper.waitFor (() => (component.selectedEntity().name!=null));
    //expect(saveSpy).toHaveBeenCalledOnce();

    expect (component.selectedEntity()).toEqual({
      _id:component.selectedEntity()!._id,
      name:'NewName',
      price: {
        amount:"12",
        currency:null
      }
    });

    // Check we are back in displaying the list
    expect (component.viewMode()).toEqual("list");
    let list = fixture.debugElement.query(By.directive(Table));
    let header = list.query(By.css('thead tr'));
    expect(header.children).toHaveLength(2); // Header
    expect(header.nativeElement.textContent).toEqual("nameprice");

    let row = list.query(By.css('tbody tr'));
    // Content
    expect(row.nativeElement.textContent).toSatisfy((text:string)=> text.indexOf('NewName')!=-1,"No edited value displayed in the list");

    row.children[0].nativeElement.click();
    row.children[0].nativeElement.click();
    fixture.detectChanges();
    await XtUnitTestHelper.waitFor (() => (component.viewMode()=="edit"));

    //It should have switched to edit mode
    expect (component.viewMode()).toEqual("edit");
    nameInput=fixture.debugElement.query(By.css('[name="name"]'));
    nameInput.nativeElement.value='NewestName';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    btnSave.children[0].nativeElement.click();
    fixture.detectChanges();
    await XtUnitTestHelper.waitFor (() => (component.selectedEntity().name=='NewestName'));

    expect (component.selectedEntity()).toEqual({
      _id:component.selectedEntity()!._id,
      name:'NewestName',
      price: {
        amount:"12",
        currency:null
      }
    });

    // Check the list content has been updated as well
    list = fixture.debugElement.query(By.directive(Table));
    row = list.query(By.css('tbody tr'));
    expect(row.nativeElement.textContent).toSatisfy((text:string)=> text.indexOf('NewestName')!=-1,"Newest value not displayed in the list");

    // Now try to delete element
    //const deleteSpy = vi.spyOn(component, 'deleteSelected');
    const btnDelete = fixture.debugElement.query(By.css("#btn-delete"));
    btnDelete.children[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();

    //expect(deleteSpy).toHaveBeenCalledOnce();
    list = fixture.debugElement.query(By.directive(Table));
    expect(list).toBeNull();
    const emptyMsg = fixture.debugElement.query(By.css('.list-details__state--empty'));
    expect(emptyMsg.nativeElement.textContent.indexOf("No entity found")).not.toEqual(-1);

  });

  it('should support back and forth list-details',async () => {
    const resolver = TestBed.inject(XtResolverService);

    resolver.registerTypes({
      "Test": {
        "name": "string",
        "price": "number"
      }
    });

    fixture = TestBed.createComponent(ListDetailsComponent);
    fixture.componentRef.setInput("config", {
      entity: 'Test',
      workflow: 'list-detail',
      data: {
        sort: {
          'price': 'descending'
        }
      }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('Test');
    fixture.detectChanges();

    // Click on new
    //const newSpy = vi.spyOn(component, 'newEntity');
    const btnNew = fixture.debugElement.query(By.css("#btn-new"));
    btnNew.children[0].nativeElement.click();
    fixture.detectChanges();
    // For some reasons, we have to wait multiple times for stability
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();

    //expect(newSpy).toHaveBeenCalledOnce();
    const form = component.editForm().get('editor') as FormGroup;
    // Check fields
    expect(Object.keys(form.controls)).toEqual([
      '_id', 'name', 'price'
    ]);

    // Now set some values in the fields
    let nameInput = fixture.debugElement.query(By.css('[name="name"]'));
    nameInput.nativeElement.value = 'NewName';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(form.value).toEqual({
      _id: component.selectedEntity()!._id,
      name: 'NewName',
      price: null
    });

    // I didn't save, so the name is still empty
    expect(component.selectedEntity().name).toBeUndefined();

    //Now click again on the list tab, without saving
    const tabList = fixture.debugElement.query(By.css('p-tab[value="list"]'));
    tabList.nativeElement.click();
    fixture.detectChanges();

    await XtUnitTestHelper.waitFor(() => (component.viewMode() == "list"));

    expect(component.viewMode()).toEqual('list');
    expect(component.selectedEntity()).toBeTruthy();

    // Another click on the item in the list should go back to edit mode
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    expect(rows.length).toEqual(1);

    // Click on the row to deselect it
    rows[0].nativeElement.click();
    fixture.detectChanges();

    await XtUnitTestHelper.waitFor(() => (component.selectedEntity() == null));

    expect(component.selectedEntity()).toBeFalsy();

      // Click again to reselect it
    const refreshedRows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    refreshedRows[0].nativeElement.click();
    fixture.detectChanges();
    await XtUnitTestHelper.waitFor(() => (component.viewMode() == "edit"));

    expect(component.viewMode()).toEqual('edit');

   });

  it('should reflect form edits in the list without saving', async () => {
    const resolver = TestBed.inject(XtResolverService);

    resolver.registerTypes({
      "Test": {
        "name": "string",
        "price": "number"
      }
    });

    fixture = TestBed.createComponent(ListDetailsComponent);
    fixture.componentRef.setInput("config", {
      entity: 'Test',
      workflow: 'list-detail',
      data: {
        sort: { 'price': 'descending' }
      }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('Test');
    fixture.detectChanges();

    // Create a new entity
    const btnNew = fixture.debugElement.query(By.css("#btn-new"));
    btnNew.children[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();
    await fixture.whenStable();

    // Edit name in the form
    const nameInput = fixture.debugElement.query(By.css('[name="name"]'));
    nameInput.nativeElement.value = 'EditedName';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Switch to list tab without saving
    const tabList = fixture.debugElement.query(By.css('p-tab[value="list"]'));
    tabList.nativeElement.click();
    fixture.detectChanges();
    await XtUnitTestHelper.waitFor(() => (component.viewMode() == "list"));

    // The list should reflect the form edit
    const list = fixture.debugElement.query(By.directive(Table));
    const row = list.query(By.css('tbody tr'));
    expect(row.nativeElement.textContent).toSatisfy(
      (text: string) => text.indexOf('EditedName') != -1,
      "Edited name should appear in the list without saving"
    );
   });
  });
