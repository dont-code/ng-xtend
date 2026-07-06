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

  currentPage = signal(0);

  visibleItems = computed(() => {
    const items = this.valueSet();
    return items.slice(this.currentPage(), this.currentPage() + 3);
  });

  canGoPrev = computed(() => this.currentPage() > 0);
  canGoNext = computed(() => this.currentPage() + 3 < this.valueSet().length);

  animKey = signal(0);
  animDir = signal<'left' | 'right'>('right');

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
    this.animDir.set('left');
    this.animKey.update(v => v + 1);
    this.currentPage.update(p => p - 1);
    this.selectCenterItem();
  }

  next() {
    if (!this.canGoNext()) return;
    this.animDir.set('right');
    this.animKey.update(v => v + 1);
    this.currentPage.update(p => p + 1);
    this.selectCenterItem();
  }

  private selectCenterItem() {
    const items = this.visibleItems();
    const centerIndex = Math.min(1, items.length - 1);
    const element = items[centerIndex];
    if (element != null) {
      this.selectionChange(element);
    }
  }

  override selectionChange(newElement: any) {
    super.selectionChange(newElement);
    const items = this.valueSet();
    const index = items.indexOf(newElement);
    if (index === -1) return;
    const total = items.length;
    const targetPage = Math.max(0, Math.min(index - 1, total - 3));
    this.currentPage.set(targetPage);
  }
}
