import { ChangeDetectionStrategy, Component, computed, effect, linkedSignal, model, output, signal, ViewChild } from '@angular/core';
import { XtCompositeComponent, XtRenderComponent } from 'xt-components';
import { Carousel } from 'primeng/carousel';

@Component({
  selector: 'lib-carousel-object-set',
  imports: [Carousel, XtRenderComponent],
  templateUrl: './carousel-object-set.component.html',
  styleUrl: './carousel-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselObjectSetComponent<T> extends XtCompositeComponent<T[]> {
  selected = model<any>();
  protected valueSelectedAsOutput = output<any>();

  private portraitQuery = window.matchMedia('(max-width: 599.98px) and (orientation: portrait)');
  isPortrait = signal<boolean>(this.portraitQuery.matches);

  numVisible = computed<number>(() => this.isPortrait() ? 1 : 3);
  carouselOrientation = computed<'horizontal' | 'vertical'>(() => this.isPortrait() ? 'vertical' : 'horizontal');

  valueSet = computed(() => {
    const ret = this.context().value();
    if (Array.isArray(ret)) {
      return ret as T[];
    } else if (ret != null) {
      return [ret] as T[];
    } else return [];
  });

  valueType = computed<string | undefined>(() => {
    const vt = this.context().valueType;
    if (vt == null) return undefined;
    return vt.endsWith('[]') ? vt.substring(0, vt.length - 2) : vt;
  });

  private selectionContext = computed(() => ({
    values: this.valueSet(),
    current: this.selected()
  }));

  selectedElement = linkedSignal<{values: T[]|null, current: T|null}, T|null>({
    source: this.selectionContext,
    computation: (source, previous) => {
      if (source.values == null || source.values.length === 0) return null;

      if (source.current != null) {
        const found = source.values.find((toCheck) => {
          if ((toCheck as any)._id != null && (source.current as any)._id != null) {
            return (toCheck as any)._id === (source.current as any)._id;
          }
          return toCheck === source.current;
        });
        if (found) return found;
      }

      if (previous?.value != null) {
        return source.values.find((toCheck) => {
          if ((toCheck as any)._id != null) {
            return (toCheck as any)._id === (previous.value as any)._id;
          }
          return toCheck === previous.value;
        }) ?? null;
      }

      return null;
    }
  });

  @ViewChild('carouselRef') carousel?: Carousel;

  constructor() {
    super();
    this.portraitQuery.addEventListener('change', (e) => this.isPortrait.set(e.matches));
    effect(() => {
      const items = this.valueSet();
      if (items.length > 0 && this.selectedElement() == null) {
        const numVis = this.numVisible();
        const center = Math.floor((numVis - 1) / 2);
        const element = items[Math.min(center, items.length - 1)];
        this.selectedElement.set(element);
        this.selected.set(element);
      }
    });
  }

  onCarouselPage(event: any): void {
    const page = event.page ?? 0;
    const items = this.valueSet();
    if (items.length === 0) return;
    const numVis = this.numVisible();
    const centerIndex = page + Math.floor((numVis - 1) / 2);
    const index = Math.min(centerIndex, items.length - 1);
    const element = items[index];
    this.selectedElement.set(element);
    this.selected.set(element);
    if (this.outputsObject.valueSelected != null) {
      this.outputsObject.valueSelected.emit(element);
    }
  }

  selectionChange(newElement: any) {
    this.selectedElement.set(newElement);
    this.selected.set(newElement);
    if (this.outputsObject.valueSelected != null) {
      this.outputsObject.valueSelected.emit(newElement);
    }
    const items = this.valueSet();
    const index = items.indexOf(newElement);
    if (index === -1) return;
    const total = items.length;
    const offset = Math.floor((this.numVisible() - 1) / 2);
    const targetPage = Math.max(0, Math.min(index - offset, total - this.numVisible()));
    if (this.carousel) {
      this.carousel.page = targetPage;
    }
  }

  override setupInputOutput() {
    const parentModel = this.models();
    if (parentModel?.valueSelected != null) {
      this.selected = parentModel.valueSelected;
    } else {
      this.outputsObject.valueSelected = this.valueSelectedAsOutput;
    }
  }
}
