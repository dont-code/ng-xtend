import { TestBed } from '@angular/core/testing';

import { DefaultObjectComponent } from './default-object.component';
import {
  HostTestTypedFormComponent,
  StoreSupport,
  StoreTestHelper,
  XtBaseContext,
  XtResolverService,XtRenderComponent
} from 'xt-components';
import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { registerDefaultPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { beforeEach, describe, expect, it } from 'vitest';
import { ManyToOneRefComponent } from '../reference/many-to-one-ref.component';
import { XtTypeInfo } from 'xt-type';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('DefaultObjectComponent', () => {
  let resolverService: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultObjectComponent],
      providers:[provideZonelessChangeDetection(), provideAnimations()]
    })
    .compileComponents();

    resolverService=TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
    StoreTestHelper.ensureTestProviderOnly();

  });

  it('should display complex type', () => {
    const fixture = TestBed.createComponent(DefaultObjectComponent);
    const component = fixture.componentInstance;
    const context= new XtBaseContext<any>('FULL_VIEW');
    context.setDisplayValue({
      test1: 'value1',
      test2: {
        test21: 'value21',
        test22: new Date(),
        test23: true
      }
    });
    fixture.componentRef.setInput('context', context);

    fixture.detectChanges();
    expect(component).toBeTruthy();

    expect (fixture.nativeElement.textContent).toContain('test22');
  });


  it ('should edit without subName', () => {
    const hostFixture = TestBed.createComponent(TestSimpleFormRenderComponent);
    const comp = hostFixture.componentInstance;

    expect(comp).toBeTruthy();
    hostFixture.detectChanges();

  })

  it('should edit complex type', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      test1: 'value1',
      test2: {
        test21: 'value21',
        test22: new Date(),
        test23: true
      }
    });
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const objectComponent = hostFixture.debugElement.query(By.directive(DefaultObjectComponent));
    expect(objectComponent).toBeTruthy();

    const test21Input = objectComponent.query(By.css('input[name="test21"]'));
    expect (test21Input.nativeElement.value).toBe('value21');

    const test23Check = objectComponent.query(By.css('input[name="test23"]'));
    expect(test23Check.attributes['type']).toBe('checkbox');

  });

  it('should properly edit reference type', async () => {
    // Register types with references
    resolverService.registerPlugin({
      name:'TestObjectRefPlugin',
      types: BOOK_AUTHOR_TYPES
    });

    resolverService.resolvePendingReferences();

    const storeMgr = StoreSupport.getStoreManager();
    const authorStore = storeMgr.getProviderSafe<AuthorTestType>('authorType');
    const bookStore = storeMgr.getProviderSafe<BookTestType>('bookType');

    const philipKDick=await authorStore.storeEntity('authorType', {
      fullName:'Philip K. Dick',
      city:'Chicago',
      born:new Date (1928, 12, 16)
    });

    const annLeckie = await authorStore.storeEntity('authorType', {
      fullName:'Ann Leckie',
      city:'Toledo',
      born:new Date (1966, 3, 2)
    });

    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      value: {
        name:null,
        authorRef: null,
        genreRef: null
      }
    });
    hostFixture.componentRef.setInput('controlName', 'value');
    hostFixture.componentRef.setInput('valueType', 'bookType');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const objectComponent = hostFixture.debugElement.query(By.directive(DefaultObjectComponent));
    expect(objectComponent).toBeTruthy();

    const refComponent = objectComponent.query(By.directive(ManyToOneRefComponent));
    expect(refComponent).toBeTruthy();

    await hostFixture.whenStable(); // Ensure the list of option is loaded

    // Simulate click on dropdown button to load all suggestions
    refComponent.query(By.css('.p-autocomplete-dropdown')).nativeElement.click();
    hostFixture.detectChanges();

    // Select a suggestion item
    let suggestionItems=refComponent.queryAll(By.css('.p-autocomplete-option'));

    expect(suggestionItems).toHaveLength(2);
    suggestionItems[0].nativeElement.click();

    hostFixture.detectChanges();
    await hostFixture.whenStable();
    await hostFixture.whenStable();
    await hostFixture.whenStable();

    // Check the value is correct
    expect(host.createdFormGroup()?.value.value['authorRef']).toEqual(philipKDick);

  });

});

type BookTestType = {
  name:string,
  authorRef: AuthorTestType,
  genreRef: string
}

type AuthorTestType = {
  fullName:string,
  born:Date,
  city:string
}

const BOOK_AUTHOR_TYPES:XtTypeInfo = {
  authorType: {
    fullName:'string',
    city:'string',
    born:'date',
  },
  bookGenreType: {
    name:'string'
  },
  bookType: {
    children:{
      name:'string',
      authorRef:{
        toType:'authorType',
        referenceType:'MANY-TO-ONE',
        field:'fullName'
      },
      genreRef: {
        toType:'bookGenreType',
        referenceType:'MANY-TO-ONE',
        field:'name'
      }
    }
  }
}

@Component({
  selector: 'test-simple-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XtRenderComponent],
  template: '<form [formGroup]="simpleFormGroup"><xt-render displayMode="FULL_EDITABLE" [formGroup]="simpleFormGroup"></xt-render> </form>'
})
export class TestSimpleFormRenderComponent {
  fb = inject(FormBuilder);

  simpleFormGroup = this.fb.group({
      name:[''],
      sub: this.fb.group({
        subName:[''],
        subValue:[134]
      }),
      date:[new Date()]
  });
}
