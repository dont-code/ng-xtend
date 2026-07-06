import { ChangeDetectionStrategy, Component, computed, effect, input, model, output, signal } from '@angular/core';
import { XtContext, XtRenderComponent } from 'xt-components';
import { ObjectSetBase } from './object-set-base';

@Component({
  selector: 'lib-carousel-object-set',
  imports: [XtRenderComponent],
  templateUrl: './carousel-object-set.component.html',
  styleUrl: './carousel-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselObjectSetComponent<T> extends ObjectSetBase<T> {
  override context = input.required<XtContext<T[]>>();
  override selected = model<any>();
  protected override valueSelectedAsOutput = output<any>();
  editRequested = output<any>();

  valueType = computed<string | undefined>(() => {
    const vt = this.context().valueType;
    if (vt == null) return undefined;
    return vt.endsWith('[]') ? vt.substring(0, vt.length - 2) : vt;
  });

  slideAnim = signal<string>('');

  currentPage = signal(0);

  visibleItems = computed(() => {
    const items = this.valueSet();
    const page = this.currentPage();
    return items.slice(Math.max(0, page - 1), page + 4);
  });

  canGoPrev = computed(() => this.currentPage() > 0);
  canGoNext = computed(() => this.currentPage() + 3 < this.valueSet().length);

  constructor() {
    super();
    effect(() => {
      const items = this.valueSet();
      if (items.length > 0 && this.selectedElement() == null) {
        const element = items[Math.min(1, items.length - 1)];
        this.selectedElement.set(element);
        this.selected.set(element);
        this.currentPage.set(0);
      }
    });
  }

  previous() {
    if (!this.canGoPrev()) return;
    this.currentPage.update(p => p - 1);
    this.selectCenterItem();
    this.slideAnim.set('slide-in-from-left');
    setTimeout(() => this.slideAnim.set(''), 300);
  }

  next() {
    if (!this.canGoNext()) return;
    this.currentPage.update(p => p + 1);
    this.selectCenterItem();
    this.slideAnim.set('slide-in-from-right');
    setTimeout(() => this.slideAnim.set(''), 300);
  }

  private selectCenterItem() {
    const items = this.valueSet();
    const centerIndex = this.currentPage() + 1;
    if (centerIndex >= 0 && centerIndex < items.length) {
      this.selectionChange(items[centerIndex]);
    }
  }

  override selectionChange(newElement: any) {
    super.selectionChange(newElement);
    const items = this.valueSet();
    const index = items.indexOf(newElement);
    if (index === -1) return;

    const currentCenter = this.currentPage() + 1;
    if (index === currentCenter) return;

    const total = items.length;
    const targetPage = Math.max(0, Math.min(index - 1, total - 3));
    const direction = index < currentCenter ? 'slide-in-from-left' : 'slide-in-from-right';

    this.currentPage.set(targetPage);
    this.slideAnim.set(direction);
    setTimeout(() => this.slideAnim.set(''), 300);
  }
}
