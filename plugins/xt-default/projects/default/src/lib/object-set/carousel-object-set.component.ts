import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { XtContext, XtRenderComponent } from 'xt-components';
import { ObjectSetBase } from './object-set-base';

@Component({
  selector: 'lib-carousel-object-set',
  imports: [XtRenderComponent],
  templateUrl: './carousel-object-set.component.html',
  styleUrl: './carousel-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'tabindex': '0'
  }
})
export class CarouselObjectSetComponent<T> extends ObjectSetBase<T> {
  private breakpointObserver = inject(BreakpointObserver);

  override context = input.required<XtContext<T[]>>();
  override selected = model<any>();
  protected override valueSelectedAsOutput = output<any>();
  editButton = input(false);
  editRequested = output<any>();

  valueType = computed<string | undefined>(() => {
    const vt = this.context().valueType;
    if (vt == null) return undefined;
    return vt.endsWith('[]') ? vt.substring(0, vt.length - 2) : vt;
  });

  isVertical = signal(false);
  isPhone = signal(false);

  protected viewportCount = computed(() => this.isPhone() ? 1 : 3);
  private centerOffset = computed(() => Math.floor((this.viewportCount() - 1) / 2));

  slideAnim = signal<string>('');
  exitingItem = signal<T | undefined>(undefined);
  verticalDir = signal<'next' | 'prev' | ''>('');

  currentPage = signal(0);

  visibleItems = computed<(T | undefined)[]>(() => {
    const items = this.valueSet();
    const page = this.currentPage();
    if (this.isVertical()) {
      const idx = Math.max(0, Math.min(page, items.length - 1));
      return items.length > 0 ? [items[idx]] : [];
    }
    const count = this.viewportCount() + 2;
    const result: (T | undefined)[] = [];
    for (let i = 0; i < count; i++) {
      const idx = page - 1 + i;
      result.push(idx >= 0 && idx < items.length ? items[idx] : undefined);
    }
    return result;
  });

  canGoPrev = computed(() => this.currentPage() > 0);
  canGoNext = computed(() => this.currentPage() + this.viewportCount() < this.valueSet().length);

  private touchStartX = 0;
  private touchStartY = 0;
  private swipeHandled = false;
  private static readonly SWIPE_THRESHOLD = 50;

  private boundKeyDown = (e: KeyboardEvent) => this.onKeyDown(e);

  constructor() {
    super();
    this.breakpointObserver.observe(Breakpoints.HandsetPortrait)
      .subscribe(state => this.isVertical.set(state.matches));
    this.breakpointObserver.observe(Breakpoints.Handset)
      .subscribe(state => this.isPhone.set(state.matches));
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundKeyDown);
    }
    effect(() => {
      const items = this.valueSet();
      if (items.length > 0 && this.selectedElement() == null) {
        const idx = Math.min(this.centerOffset(), items.length - 1);
        const element = items[idx];
        this.selectedElement.set(element);
        this.selected.set(element);
        this.currentPage.set(0);
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyDown);
    }
  }

  previous() {
    if (!this.canGoPrev() || this.exitingItem()) return;
    if (this.isVertical()) {
      const items = this.valueSet();
      const idx = Math.max(0, Math.min(this.currentPage(), items.length - 1));
      this.exitingItem.set(items[idx]);
      this.currentPage.update(p => p - 1);
      this.selectCenterItem();
      this.verticalDir.set('prev');
      setTimeout(() => { this.exitingItem.set(undefined); this.verticalDir.set(''); }, 350);
    } else {
      this.currentPage.update(p => p - 1);
      this.selectCenterItem();
      this.slideAnim.set('slide-in-from-left');
      setTimeout(() => this.slideAnim.set(''), 300);
    }
  }

  next() {
    if (!this.canGoNext() || this.exitingItem()) return;
    if (this.isVertical()) {
      const items = this.valueSet();
      const idx = Math.max(0, Math.min(this.currentPage(), items.length - 1));
      this.exitingItem.set(items[idx]);
      this.currentPage.update(p => p + 1);
      this.selectCenterItem();
      this.verticalDir.set('next');
      setTimeout(() => { this.exitingItem.set(undefined); this.verticalDir.set(''); }, 350);
    } else {
      this.currentPage.update(p => p + 1);
      this.selectCenterItem();
      this.slideAnim.set('slide-in-from-right');
      setTimeout(() => this.slideAnim.set(''), 300);
    }
  }

  private selectCenterItem() {
    const items = this.valueSet();
    const centerIndex = this.currentPage() + this.centerOffset();
    if (centerIndex >= 0 && centerIndex < items.length) {
      this.selectionChange(items[centerIndex]);
    }
  }

  override selectionChange(newElement: any) {
    super.selectionChange(newElement);
    const items = this.valueSet();
    const index = items.indexOf(newElement);
    if (index === -1) return;

    const currentCenter = this.currentPage() + this.centerOffset();
    if (index === currentCenter) return;

    const total = items.length;
    const targetPage = Math.max(0, Math.min(index - this.centerOffset(), total - this.viewportCount()));
    const goLeft = index < currentCenter;

    if (this.isVertical()) {
      if (this.exitingItem()) return;
      const idx = Math.max(0, Math.min(this.currentPage(), items.length - 1));
      this.exitingItem.set(items[idx]);
      this.currentPage.set(targetPage);
      this.verticalDir.set(goLeft ? 'prev' : 'next');
      setTimeout(() => { this.exitingItem.set(undefined); this.verticalDir.set(''); }, 350);
    } else {
      this.currentPage.set(targetPage);
      this.slideAnim.set(goLeft ? 'slide-in-from-left' : 'slide-in-from-right');
      setTimeout(() => this.slideAnim.set(''), 300);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.isVertical()) {
      if (event.key === 'ArrowUp') { event.preventDefault(); this.previous(); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); this.next(); }
    } else {
      if (event.key === 'ArrowLeft') { event.preventDefault(); this.previous(); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); this.next(); }
    }
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.swipeHandled = false;
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1 || this.swipeHandled) return;
    const dx = event.touches[0].clientX - this.touchStartX;
    const dy = event.touches[0].clientY - this.touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (!this.isVertical() && absDx > absDy && absDx > 10) {
      event.preventDefault();
    } else if (this.isVertical() && absDy > absDx && absDy > 10) {
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (this.swipeHandled) return;
    const changed = event.changedTouches[0];
    if (!changed) return;
    const dx = changed.clientX - this.touchStartX;
    const dy = changed.clientY - this.touchStartY;
    const threshold = CarouselObjectSetComponent.SWIPE_THRESHOLD;
    if (this.isVertical()) {
      if (Math.abs(dy) >= threshold && Math.abs(dy) > Math.abs(dx)) {
        this.swipeHandled = true;
        if (dy < 0) { this.next(); } else { this.previous(); }
      }
    } else {
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy)) {
        this.swipeHandled = true;
        if (dx < 0) { this.next(); } else { this.previous(); }
      }
    }
  }
}
