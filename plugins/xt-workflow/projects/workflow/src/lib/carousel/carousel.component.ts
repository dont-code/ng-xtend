import { Component, inject, linkedSignal, OnInit } from '@angular/core';
import { AbstractDcWorkflow } from 'dc-workflow';
import { XtMessageHandler, XtRenderComponent } from 'xt-components';
import { ManagedData } from 'xt-type';
import { Carousel } from 'primeng/carousel';
import { ProgressSpinner } from 'primeng/progressspinner';

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

  override ngOnInit() {
    super.ngOnInit();
    this.fetchFromStore();
  }
}
