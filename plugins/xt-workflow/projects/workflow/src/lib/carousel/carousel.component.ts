import { Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
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

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.fetchFromStore();
  }
}
