import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultObjectSetComponent } from './default-object-set.component';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { StoreSupport, StoreTestHelper, XtBaseContext, XtResolverService, XtSimpleComponent } from 'xt-components';
import { registerDefaultPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { XtTypeInfo } from 'xt-type';

type TestData= {
  simpleText:string,
  simpleDate:Date,
  simpleNumber:number,
  simpleBoolean:boolean
}

type IdentifiedTestData = TestData & {
  _id:string;
}

describe('DefaultObjectSetComponent', () => {

  let resolverService:XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultObjectSetComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    StoreTestHelper.ensureTestProviderOnly();
    resolverService = TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
  });

  it('should display a list', async () => {
    let component: DefaultObjectSetComponent<TestData>;
    let fixture: ComponentFixture<DefaultObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(DefaultObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>("INLINE_VIEW");
    context.setDisplayValue([{
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }, {
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }]);

    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.subNames()).toEqual(['simpleText', 'simpleDate', 'simpleNumber', 'simpleBoolean']);

    const firstElementContext = component.elementSetContext(0);
    expect(firstElementContext.value()).toEqual({
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    });

    const firstElementNumberContext = component.subElementContextForName(firstElementContext, 'simpleNumber');
    expect(firstElementNumberContext.value()).toEqual(11);

    const headers = fixture.debugElement.queryAll(By.css('th')).map((debugElem) => {
      return debugElem.nativeElement.textContent;
    });

    expect(headers).toEqual(['simpleText', 'simpleDate', 'simpleNumber', 'simpleBoolean']);

    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    expect(rows.length).toEqual(3);

    const secondElementValues = rows[1].queryAll(By.css('td')).map((debugElem) => {
      let ret= debugElem.nativeElement.textContent;
      if (ret!=null) ret= ret.trim();
      return ret;
    });

    expect(secondElementValues).toEqual(['hola','Mar 2, 1972', "12", ""]);
    const booleanCheckbox = rows[1].query(By.css('input[type="checkbox"]'));
    expect(booleanCheckbox).toBeDefined();
    expect(booleanCheckbox.properties['readOnly']).toBeTruthy();
    expect(booleanCheckbox.properties['disabled']).toBeTruthy();
    expect(booleanCheckbox.properties['value']).toEqual('on');
  });

  it('should enable element selection', () => {
    let component: DefaultObjectSetComponent<TestData>;
    let fixture: ComponentFixture<DefaultObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(DefaultObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>("LIST_VIEW");
    context.setDisplayValue([{
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }, {
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }]);

    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    rows[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

  });

  it('should keep element selection if possible', () => {
    let component: DefaultObjectSetComponent<IdentifiedTestData>;
    let fixture: ComponentFixture<DefaultObjectSetComponent<IdentifiedTestData>>;

    fixture = TestBed.createComponent(DefaultObjectSetComponent<IdentifiedTestData>);
    let context = new XtBaseContext<IdentifiedTestData[]>("LIST_VIEW");
    context.setDisplayValue([{
      _id:'11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      _id:'12',
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }, {
      _id:'13',
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }]);

    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    rows[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

    // Now refresh the display values, did he keep the element selected ?
    context.setDisplayValue([{
      _id:'11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      _id:'13',
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }, {
      _id:'12',
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }]);

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);
      // Is it kept while deleting another element ?
    context.setDisplayValue([{
      _id:'11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      _id:'12',
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }]);
    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

      // Now refresh the values without the selected element, is it now null ?
    context.setDisplayValue([{
      _id:'11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }]);

    expect(component.selectedElement()).toBeNull();
  });

  it('should keep selection even without Ids', () => {
    let component: DefaultObjectSetComponent<TestData>;
    let fixture: ComponentFixture<DefaultObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(DefaultObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>("LIST_VIEW");
    const values: Array<TestData>= [{
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }, {
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }];

    context.setDisplayValue(values);

    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    rows[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

    // Now refresh the display values, did he keep the element selected ?
    values[1].simpleNumber=14;
    context.setDisplayValue([...values]);

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(14);
    // Is it kept while deleting another element ?

    context.setDisplayValue(values.slice(0,2));
    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(14);

    // Now refresh the values without the selected element, is it now null ?
    context.setDisplayValue(values.slice(0,1));

    expect(component.selectedElement()).toBeNull();
  });

  it('should support references', async () => {
    // Register types with references
    resolverService.registerPlugin({
      name:'TestRefPlugin',
      types: BOOK_AUTHOR_TYPES,
      components: [
        {
          componentName:'testAuthorComponent',
          componentClass:TestAuthorComponent,
          typesHandled: ['authorType']
        }
      ]
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

    const AnnLeckie = await authorStore.storeEntity('authorType', {
      fullName:'Ann Leckie',
      city:'Toledo',
      born:new Date (1966, 3, 2)
    });

    // We simulate a reference by injecting the entity directly
    await bookStore.storeEntity('bookType', {
      name:'Ubik',
      authorRef:philipKDick,
      genreRef:'SF'
    });

    await bookStore.storeEntity('bookType', {
      name:'Ancillaire',
      authorRef:AnnLeckie,
      genreRef:'Space Opera'
    });

    let component: DefaultObjectSetComponent<BookTestType>;
    let fixture: ComponentFixture<DefaultObjectSetComponent<BookTestType>>;

    fixture = TestBed.createComponent(DefaultObjectSetComponent<BookTestType>);
    let context = new XtBaseContext<BookTestType[]>("LIST_VIEW");
    context.setDisplayValue(await firstValueFrom(bookStore.searchEntities('bookType')), 'bookType');

    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    expect(rows).toHaveLength(2);
    const cols = fixture.debugElement.queryAll(By.css('thead > tr > th'));
    expect(cols).toHaveLength(3);

    // Check that the reference has been crossed and author city is displayed
    expect(rows[0].children[1].nativeElement.textContent).toContain('Philip K. Dick(Chicago)');
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

/**
 * A custom component is defined to display authors. It must be used by the set
 */
@Component({
  selector: 'test-author',
  standalone: true,
  imports: [CommonModule],
  template: '@if (isInForm()) {\
    \
    \
  } @else {\
  @let value=displayValue();\
  @if (value!=null) {\
    @if (context().displayMode=="INLINE_VIEW") {\
     {{value.fullName}}({{value.city}})\
     }\
  }\
  \
  }',
})

export class TestAuthorComponent extends XtSimpleComponent<AuthorTestType> {
}
