import { Component, computed, inject, linkedSignal, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractDcWorkflow } from 'dc-workflow';
import { XtMessageHandler, XtRenderComponent } from 'xt-components';
import { ManagedData } from 'xt-type';
import { Carousel } from 'primeng/carousel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * A workflow displaying the list through a carousel. It automatically selects the first element to display
 */
@Component({
  selector: 'wfw-carousel',
  imports: [
    Carousel,
    ProgressSpinner, XtRenderComponent
  ],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent <T extends ManagedData> extends AbstractDcWorkflow<T> implements OnInit {

  protected bkObserver = inject(BreakpointObserver);

  isPortrait=toSignal(this.bkObserver.observe(Breakpoints.HandsetPortrait).pipe(map (result => {
    return result.matches;
  })));

  numVisible = computed<number>(() => {
    if (this.isPortrait()) return 1;
    else return 3;
  });

  carouselOrientation = computed<'horizontal'|'vertical'>(() => {
    if (this.isPortrait()) return 'vertical';
    else return 'horizontal';
  });

  selectedElement = signal<T | null>(null);

  @ViewChild('carouselRef') carousel?: Carousel;

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.fetchFromStore();
  }

  selectElement(element: T): void {
    this.selectedElement.set(element);
    const items = this.displayableElements();
    const index = items.indexOf(element);
    if (index === -1) return;
    const total = items.length;
    const offset = Math.floor((this.numVisible() - 1) / 2);
    const targetPage = Math.max(0, Math.min(index - offset, total - this.numVisible()));
    if (this.carousel) {
      this.carousel.page = targetPage;
    }
  }
}
