import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselObjectSetComponent } from './carousel-object-set.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { StoreTestHelper, XtBaseContext, XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

type TestData = {
  simpleText: string;
  simpleDate: Date;
  simpleNumber: number;
  simpleBoolean: boolean;
};

type IdentifiedTestData = TestData & {
  _id: string;
};

describe('CarouselObjectSetComponent', () => {

  let resolverService: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselObjectSetComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    StoreTestHelper.ensureTestProviderOnly();
    resolverService = TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
  });

  it('should create', () => {
    let component: CarouselObjectSetComponent<TestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(CarouselObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>('INLINE_VIEW');
    context.setDisplayValue([{
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }]);

    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display items in carousel', () => {
    let component: CarouselObjectSetComponent<TestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(CarouselObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>('INLINE_VIEW');
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

    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.valueSet().length).toEqual(3);

    const panels = fixture.debugElement.queryAll(By.css('.carousel-object-set__panel'));
    expect(panels.length).toEqual(3);

    const navButtons = fixture.debugElement.queryAll(By.css('.carousel-object-set__nav'));
    expect(navButtons.length).toEqual(2);
  });

  it('should enable element selection', () => {
    let component: CarouselObjectSetComponent<TestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(CarouselObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>('LIST_VIEW');
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

    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    component.selectionChange(component.valueSet()[1]);
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);
  });

  it('should keep element selection if possible', () => {
    let component: CarouselObjectSetComponent<IdentifiedTestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<IdentifiedTestData>>;

    fixture = TestBed.createComponent(CarouselObjectSetComponent<IdentifiedTestData>);
    let context = new XtBaseContext<IdentifiedTestData[]>('LIST_VIEW');
    context.setDisplayValue([{
      _id: '11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      _id: '12',
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }, {
      _id: '13',
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }]);

    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    component.selectionChange(component.valueSet()[1]);
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

    context.setDisplayValue([{
      _id: '11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      _id: '13',
      simpleText: 'guten tag',
      simpleDate: new Date(1973, 3, 3),
      simpleNumber: 13,
      simpleBoolean: false
    }, {
      _id: '12',
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }]);

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

    context.setDisplayValue([{
      _id: '11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }, {
      _id: '12',
      simpleText: 'hola',
      simpleDate: new Date(1972, 2, 2),
      simpleNumber: 12,
      simpleBoolean: true
    }]);

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

    context.setDisplayValue([{
      _id: '11',
      simpleText: 'bonjour',
      simpleDate: new Date(1971, 1, 1),
      simpleNumber: 11,
      simpleBoolean: false
    }]);

    expect(component.selectedElement()).toBeNull();
  });

  it('should keep selection even without Ids', () => {
    let component: CarouselObjectSetComponent<TestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<TestData>>;

    fixture = TestBed.createComponent(CarouselObjectSetComponent<TestData>);
    let context = new XtBaseContext<TestData[]>('LIST_VIEW');
    const values: Array<TestData> = [{
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

    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    component.selectionChange(component.valueSet()[1]);
    fixture.detectChanges();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(12);

    values[1].simpleNumber = 14;
    context.setDisplayValue([...values]);

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(14);

    context.setDisplayValue(values.slice(0, 2));
    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.simpleNumber).toEqual(14);

    context.setDisplayValue(values.slice(0, 1));
    expect(component.selectedElement()).toBeNull();
  });
});
