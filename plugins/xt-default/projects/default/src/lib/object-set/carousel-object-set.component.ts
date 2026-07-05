import { ChangeDetectionStrategy, Component, computed, effect, model, output, signal, ViewChild } from '@angular/core';
import { XtRenderComponent } from 'xt-components';
import { Carousel } from 'primeng/carousel';
import { ObjectSetBase } from './object-set-base';

/**
 * Carousel-based object-set component.
 *
 * Displays items in a PrimeNG Carousel with responsive layout:
 * - 3 visible items in landscape, 1 in portrait.
 * - The centered item is tracked as the selection.
 * - Selecting an item (by click or carousel navigation) syncs the page to center it.
 */
@Component({
  selector: 'lib-carousel-object-set',
  imports: [Carousel, XtRenderComponent],
  templateUrl: './carousel-object-set.component.html',
  styleUrl: './carousel-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselObjectSetComponent<T> extends ObjectSetBase<T> {
  override selected = model<any>();
  protected override valueSelectedAsOutput = output<any>();

  /** Media query for portrait orientation on small screens. */
  private portraitQuery = window.matchMedia('(max-width: 599.98px) and (orientation: portrait)');

  /** Whether the viewport is currently in portrait mode. */
  isPortrait = signal<boolean>(this.portraitQuery.matches);

  /** Number of items visible at once in the carousel. */
  numVisible = computed<number>(() => this.isPortrait() ? 1 : 3);

  /** Offset from the start of the page to the center item. */
  centerOffset = computed(() => Math.floor((this.numVisible() - 1) / 2));

  /** Carousel scroll direction: vertical in portrait, horizontal otherwise. */
  carouselOrientation = computed<'horizontal' | 'vertical'>(() => this.isPortrait() ? 'vertical' : 'horizontal');

  /** The element type, stripped of the `[]` suffix for rendering individual items. */
  valueType = computed<string | undefined>(() => {
    const vt = this.context().valueType;
    if (vt == null) return undefined;
    return vt.endsWith('[]') ? vt.substring(0, vt.length - 2) : vt;
  });

  @ViewChild('carouselRef') carousel?: Carousel;

  constructor() {
    super();
    this.portraitQuery.addEventListener('change', (e) => this.isPortrait.set(e.matches));
    /** Auto-select the first item when the list loads and nothing is selected yet. */
    effect(() => {
      const items = this.valueSet();
      if (items.length > 0 && this.selectedElement() == null) {
        const offset = this.centerOffset();
        const element = items[Math.min(offset, items.length - 1)];
        this.selectedElement.set(element);
        this.selected.set(element);
        this.currentPage.set(0);
      }
    });
  }

  /** Handles carousel page change events, updating selection to the centered item. */
  onCarouselPage(event: any): void {
    const page = event.page ?? 0;
    this.currentPage.set(page);
    const items = this.valueSet();
    if (items.length === 0) return;
    const centerIndex = page + this.centerOffset();
    const index = Math.min(centerIndex, items.length - 1);
    const element = items[index];
    this.selectedElement.set(element);
    this.selected.set(element);
    if (this.outputsObject.valueSelected != null) {
      this.outputsObject.valueSelected.emit(element);
    }
  }

  /** Current carousel page index (0-based). */
  currentPage = signal(0);

  /**
   * Extends base selectionChange to also scroll the carousel so the newly selected
   * item lands at (or near) the center of the visible window.
   */
  override selectionChange(newElement: any) {
    super.selectionChange(newElement);
    const items = this.valueSet();
    const index = items.indexOf(newElement);
    if (index === -1) return;
    const total = items.length;
    const numVis = this.numVisible();
    const targetPage = Math.max(0, Math.min(index - this.centerOffset(), total - numVis));
    this.currentPage.set(targetPage);
    if (this.carousel) {
      this.carousel.page = targetPage;
    }
  }
}
