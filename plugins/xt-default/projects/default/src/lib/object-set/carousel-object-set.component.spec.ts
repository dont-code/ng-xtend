import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselObjectSetComponent } from './carousel-object-set.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { StoreTestHelper, XtBaseContext, XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    expect(panels.length).toEqual(5);

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

  it('should show 1 item vertical layout in phone portrait mode', () => {
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
    component.isVertical.set(true);
    component.isPhone.set(true);
    fixture.detectChanges();

    expect(component).toBeTruthy();

    const root = fixture.debugElement.query(By.css('.carousel-object-set'));
    expect(root.nativeElement.classList.contains('carousel-object-set--vertical')).toBeTruthy();

    const track = fixture.debugElement.query(By.css('.carousel-object-set__track'));
    expect(track.nativeElement.classList.contains('carousel-object-set--single')).toBeTruthy();

    const panels = fixture.debugElement.queryAll(By.css('.carousel-object-set__panel'));
    const visiblePanels = panels.filter(p => !p.nativeElement.classList.contains('carousel-object-set__panel--placeholder'));
    expect(visiblePanels.length).toEqual(1);

    const prevBtn = fixture.debugElement.query(By.css('.carousel-object-set__nav--prev i'));
    expect(prevBtn.nativeElement.classList.contains('pi-chevron-up')).toBeTruthy();

    const nextBtn = fixture.debugElement.query(By.css('.carousel-object-set__nav--next i'));
    expect(nextBtn.nativeElement.classList.contains('pi-chevron-down')).toBeTruthy();
  });

  it('should show 1 item horizontal layout in phone landscape mode', () => {
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
    component.isVertical.set(false);
    component.isPhone.set(true);
    fixture.detectChanges();

    expect(component).toBeTruthy();

    const root = fixture.debugElement.query(By.css('.carousel-object-set'));
    expect(root.nativeElement.classList.contains('carousel-object-set--vertical')).toBeFalsy();

    const track = fixture.debugElement.query(By.css('.carousel-object-set__track'));
    expect(track.nativeElement.classList.contains('carousel-object-set--single')).toBeTruthy();

    const selectedPanels = fixture.debugElement.queryAll(By.css('.carousel-object-set__panel--selected'));
    expect(selectedPanels.length).toEqual(1);

    const prevBtn = fixture.debugElement.query(By.css('.carousel-object-set__nav--prev i'));
    expect(prevBtn.nativeElement.classList.contains('pi-chevron-left')).toBeTruthy();

    const nextBtn = fixture.debugElement.query(By.css('.carousel-object-set__nav--next i'));
    expect(nextBtn.nativeElement.classList.contains('pi-chevron-right')).toBeTruthy();
  });

  it('should show 3 items horizontal layout in tablet/desktop mode', () => {
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
    component.isVertical.set(false);
    component.isPhone.set(false);
    fixture.detectChanges();

    expect(component).toBeTruthy();

    const root = fixture.debugElement.query(By.css('.carousel-object-set'));
    expect(root.nativeElement.classList.contains('carousel-object-set--vertical')).toBeFalsy();

    const track = fixture.debugElement.query(By.css('.carousel-object-set__track'));
    expect(track.nativeElement.classList.contains('carousel-object-set--single')).toBeFalsy();

    const selectedPanels = fixture.debugElement.queryAll(By.css('.carousel-object-set__panel--selected'));
    expect(selectedPanels.length).toEqual(1);

    const prevBtn = fixture.debugElement.query(By.css('.carousel-object-set__nav--prev i'));
    expect(prevBtn.nativeElement.classList.contains('pi-chevron-left')).toBeTruthy();

    const nextBtn = fixture.debugElement.query(By.css('.carousel-object-set__nav--next i'));
    expect(nextBtn.nativeElement.classList.contains('pi-chevron-right')).toBeTruthy();
  });

  function createTouchEvent(type: string, x: number, y: number, changed = false): TouchEvent {
    const touch = { clientX: x, clientY: y, identifier: 0 } as Touch;
    const event = {
      type,
      touches: type === 'touchend' ? [] : [touch],
      changedTouches: [touch],
      preventDefault: vi.fn(),
    } as unknown as TouchEvent;
    return event;
  }

  function createSwipeSequence(
    component: CarouselObjectSetComponent<TestData>,
    startX: number, startY: number,
    endX: number, endY: number,
    durationMs: number
  ) {
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + durationMs / 2)
      .mockReturnValueOnce(now + durationMs);

    component.onTouchStart(createTouchEvent('touchstart', startX, startY));
    component.onTouchMove(createTouchEvent('touchmove', startX + (endX - startX) / 2, startY + (endY - startY) / 2));
    component.onTouchEnd(createTouchEvent('touchend', endX, endY, true));
  }

  describe('touch swipe vs scroll behavior', () => {
    let component: CarouselObjectSetComponent<TestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<TestData>>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(CarouselObjectSetComponent<TestData>);
      const context = new XtBaseContext<TestData[]>('LIST_VIEW');
      context.setDisplayValue([
        { simpleText: 'a', simpleDate: new Date(), simpleNumber: 1, simpleBoolean: false },
        { simpleText: 'b', simpleDate: new Date(), simpleNumber: 2, simpleBoolean: true },
        { simpleText: 'c', simpleDate: new Date(), simpleNumber: 3, simpleBoolean: false },
        { simpleText: 'd', simpleDate: new Date(), simpleNumber: 4, simpleBoolean: true },
        { simpleText: 'e', simpleDate: new Date(), simpleNumber: 5, simpleBoolean: false },
        { simpleText: 'f', simpleDate: new Date(), simpleNumber: 6, simpleBoolean: true },
      ]);
      fixture.componentRef.setInput('context', context);
      component = fixture.componentInstance;
      component.isVertical.set(false);
      component.isPhone.set(false);
      fixture.detectChanges();
      vi.restoreAllMocks();
    });

    it('should navigate to next on fast horizontal swipe left', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 300, 200, 100, 200, 50);
      expect(component.currentPage()).toBe(initialPage + 1);
    });

    it('should navigate to previous on fast horizontal swipe right', () => {
      component.currentPage.set(1);
      const initialPage = component.currentPage();
      createSwipeSequence(component, 100, 200, 300, 200, 50);
      expect(component.currentPage()).toBe(initialPage - 1);
    });

    it('should NOT navigate on slow horizontal movement', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 300, 200, 100, 200, 2000);
      expect(component.currentPage()).toBe(initialPage);
    });

    it('should NOT navigate on slow movement even with large distance', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 400, 200, 50, 200, 3000);
      expect(component.currentPage()).toBe(initialPage);
    });

    it('should NOT navigate on short swipe even if fast', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 200, 200, 180, 200, 10);
      expect(component.currentPage()).toBe(initialPage);
    });

    it('should NOT navigate on diagonal swipe', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 300, 300, 100, 50, 50);
      expect(component.currentPage()).toBe(initialPage);
    });

    it('should call preventDefault on fast horizontal swipe in touchmove', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 10)
        .mockReturnValueOnce(now + 20);

      const startEvent = createTouchEvent('touchstart', 300, 200);
      const moveEvent = createTouchEvent('touchmove', 200, 200);
      const endEvent = createTouchEvent('touchend', 100, 200, true);

      component.onTouchStart(startEvent);
      component.onTouchMove(moveEvent);
      expect(moveEvent.preventDefault).toHaveBeenCalled();
      component.onTouchEnd(endEvent);
    });

    it('should NOT call preventDefault on slow horizontal movement in touchmove', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 500)
        .mockReturnValueOnce(now + 1000);

      const startEvent = createTouchEvent('touchstart', 300, 200);
      const moveEvent = createTouchEvent('touchmove', 280, 200);
      const endEvent = createTouchEvent('touchend', 260, 200, true);

      component.onTouchStart(startEvent);
      component.onTouchMove(moveEvent);
      expect(moveEvent.preventDefault).not.toHaveBeenCalled();
      component.onTouchEnd(endEvent);
    });

    it('should NOT call preventDefault on vertical movement in horizontal mode', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 10)
        .mockReturnValueOnce(now + 20);

      const startEvent = createTouchEvent('touchstart', 200, 300);
      const moveEvent = createTouchEvent('touchmove', 200, 200);
      const endEvent = createTouchEvent('touchend', 200, 100, true);

      component.onTouchStart(startEvent);
      component.onTouchMove(moveEvent);
      expect(moveEvent.preventDefault).not.toHaveBeenCalled();
      component.onTouchEnd(endEvent);
    });

    it('should reset swipeHandled on new touch start', () => {
      createSwipeSequence(component, 300, 200, 100, 200, 50);
      const pageAfterFirst = component.currentPage();
      expect(pageAfterFirst).toBe(1);

      vi.restoreAllMocks();
      createSwipeSequence(component, 300, 200, 100, 200, 50);
      expect(component.currentPage()).toBe(pageAfterFirst + 1);
    });

    it('should ignore multi-touch gestures', () => {
      const initialPage = component.currentPage();
      const startEvent = {
        type: 'touchstart',
        touches: [
          { clientX: 100, clientY: 200, identifier: 0 },
          { clientX: 200, clientY: 200, identifier: 1 },
        ],
        changedTouches: [],
        preventDefault: vi.fn(),
      } as unknown as TouchEvent;

      component.onTouchStart(startEvent);
      const moveEvent = createTouchEvent('touchmove', 50, 200);
      component.onTouchMove(moveEvent);
      const endEvent = createTouchEvent('touchend', 50, 200, true);
      component.onTouchEnd(endEvent);

      expect(component.currentPage()).toBe(initialPage);
    });
  });

  describe('touch swipe in vertical mode', () => {
    let component: CarouselObjectSetComponent<TestData>;
    let fixture: ComponentFixture<CarouselObjectSetComponent<TestData>>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(CarouselObjectSetComponent<TestData>);
      const context = new XtBaseContext<TestData[]>('LIST_VIEW');
      context.setDisplayValue([
        { simpleText: 'a', simpleDate: new Date(), simpleNumber: 1, simpleBoolean: false },
        { simpleText: 'b', simpleDate: new Date(), simpleNumber: 2, simpleBoolean: true },
        { simpleText: 'c', simpleDate: new Date(), simpleNumber: 3, simpleBoolean: false },
      ]);
      fixture.componentRef.setInput('context', context);
      component = fixture.componentInstance;
      component.isVertical.set(true);
      component.isPhone.set(true);
      fixture.detectChanges();
      vi.restoreAllMocks();
    });

    it('should navigate to next on fast vertical swipe up', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 200, 300, 200, 100, 50);
      expect(component.currentPage()).toBe(initialPage + 1);
    });

    it('should navigate to previous on fast vertical swipe down', () => {
      component.currentPage.set(1);
      const initialPage = component.currentPage();
      createSwipeSequence(component, 200, 100, 200, 300, 50);
      expect(component.currentPage()).toBe(initialPage - 1);
    });

    it('should NOT navigate on slow vertical movement', () => {
      const initialPage = component.currentPage();
      createSwipeSequence(component, 200, 300, 200, 100, 2000);
      expect(component.currentPage()).toBe(initialPage);
    });

    it('should call preventDefault on fast vertical swipe in vertical mode', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 10)
        .mockReturnValueOnce(now + 20);

      const startEvent = createTouchEvent('touchstart', 200, 300);
      const moveEvent = createTouchEvent('touchmove', 200, 200);
      const endEvent = createTouchEvent('touchend', 200, 100, true);

      component.onTouchStart(startEvent);
      component.onTouchMove(moveEvent);
      expect(moveEvent.preventDefault).toHaveBeenCalled();
      component.onTouchEnd(endEvent);
    });

    it('should NOT call preventDefault on slow vertical movement in vertical mode', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 500)
        .mockReturnValueOnce(now + 1000);

      const startEvent = createTouchEvent('touchstart', 200, 300);
      const moveEvent = createTouchEvent('touchmove', 200, 280);
      const endEvent = createTouchEvent('touchend', 200, 260, true);

      component.onTouchStart(startEvent);
      component.onTouchMove(moveEvent);
      expect(moveEvent.preventDefault).not.toHaveBeenCalled();
      component.onTouchEnd(endEvent);
    });
  });
});
