import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityManagerComponent } from './entity-manager.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { routes } from '../app.routes';
import { provideRouter } from '@angular/router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { RouterTestingHarness } from '@angular/router/testing';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService } from 'xt-components';
import { StoreTestBed } from 'xt-store';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';

describe('EntityManagerComponent', () => {
  let component: EntityManagerComponent;
  let fixture: ComponentFixture<EntityManagerComponent>;
  let storeTestBed: StoreTestBed;

  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityManagerComponent],
      providers: [provideExperimentalZonelessChangeDetection(), provideRouter(routes), provideNoopAnimations(), MessageService]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));
    storeTestBed = new StoreTestBed();
    storeTestBed.ensureMemoryProviderOnly();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EntityManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display list of entity',async () => {
    await storeTestBed.defineTestDataFor('Test',[{
      _id:"1",
      testString:'string1',
      testBoolean: false
    }]);

    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/entity/'+'Test', EntityManagerComponent);
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('Test');
    harness.fixture.detectChanges();

    const debugElement = harness.fixture.debugElement.query(By.directive(EntityManagerComponent));
    expect(debugElement.nativeElement.textContent).toContain( 'string1');
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

    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/entity/'+'NewElement', EntityManagerComponent);
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('NewElement');
    harness.fixture.detectChanges();

    // Click on new
    const newSpy = vi.spyOn(component, 'newEntity');
    const btnNew = harness.fixture.debugElement.query(By.css("#btn-new"));
    btnNew.children[0].nativeElement.click();
    harness.fixture.detectChanges();
    // For some reasons, we have to wait multiple times for stability
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    expect(newSpy).toHaveBeenCalledOnce();
    const form=component.editForm().get('editor') as FormGroup;
    // Check fields
    expect(Object.keys(form.controls)).toEqual([
      '_id','name','price'
    ]);
    expect(Object.keys((form.get('price') as FormGroup).controls)).toEqual(['amount', 'currency']);

    // Now set some values in the fields
    let nameInput=harness.fixture.debugElement.query(By.css('[name="name"]'));
    nameInput.nativeElement.value='NewName';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
    const amountInput = harness.fixture.debugElement.query(By.css('[name="amount"]'));
    amountInput.nativeElement.value='12';
    amountInput.nativeElement.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();

    expect(form.value).toEqual({
      _id:component.selectedEntity()!._id,
      name:'NewName',
      price: {
        amount:"12",
        currency:null
      }
    });

    //Click on save
    const saveSpy = vi.spyOn(component, 'save');
    const btnSave = harness.fixture.debugElement.query(By.css("#btn-save"));
    btnSave.children[0].nativeElement.click();
    harness.fixture.detectChanges();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    expect(saveSpy).toHaveBeenCalledOnce();

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
    let list = harness.fixture.debugElement.query(By.directive(Table));
    let header = list.query(By.css('thead tr'));
    expect(header.children).toHaveLength(2); // Header
    expect(header.nativeElement.textContent).toEqual("nameprice");

    let row = list.query(By.css('tbody tr'));
    // Content
    expect(row.nativeElement.textContent).toSatisfy((text:string)=> text.indexOf('NewName')!=-1,"No edited value displayed in the list");

    row.children[0].nativeElement.click();
    row.children[0].nativeElement.click();
    row.children[0].nativeElement.click();
    harness.fixture.detectChanges();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    //It should have switched to edit mode
    expect (component.viewMode()).toEqual("edit");
    nameInput=harness.fixture.debugElement.query(By.css('[name="name"]'));
    nameInput.nativeElement.value='NewestName';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();

    btnSave.children[0].nativeElement.click();
    harness.fixture.detectChanges();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();


    expect (component.selectedEntity()).toEqual({
      _id:component.selectedEntity()!._id,
      name:'NewestName',
      price: {
        amount:"12",
        currency:null
      }
    });

    // Check the list content has been updated as well
    list = harness.fixture.debugElement.query(By.directive(Table));
    row = list.query(By.css('tbody tr'));
    expect(row.nativeElement.textContent).toSatisfy((text:string)=> text.indexOf('NewestName')!=-1,"Newest value not displayed in the list");

    // Now try to delete element
    const deleteSpy = vi.spyOn(component, 'deleteSelected');
    const btnDelete = harness.fixture.debugElement.query(By.css("#btn-delete"));
    btnDelete.children[0].nativeElement.click();
    harness.fixture.detectChanges();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    expect(deleteSpy).toHaveBeenCalledOnce();
    list = harness.fixture.debugElement.query(By.directive(Table));
    const rows = list.queryAll(By.css('tbody tr'));
    expect(rows).toHaveLength(0);

  });


});
