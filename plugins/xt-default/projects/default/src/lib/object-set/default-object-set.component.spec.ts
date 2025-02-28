import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultObjectSetComponent } from './default-object-set.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { expect } from '@jest/globals';
import { registerDefaultPlugin } from '../register';
import { By } from '@angular/platform-browser';

type TestData= {
  simpleText:string,
  simpleDate:Date,
  simpleNumber:number,
  simpleBoolean:boolean

}

describe('DefaultObjectSetComponent', () => {

  let resolverService:XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultObjectSetComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    resolverService = TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
  });

  it('should display a list', () => {
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

    expect(secondElementValues).toEqual(['hola',new Date(1972, 2, 2).toString(), "12", "true"]);
  }),

  it('should enable element selection', () => {
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
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));
    rows[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

  });
});
