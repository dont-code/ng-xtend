import { ModelSignal } from '@angular/core';
import { XtComponentModel } from '../xt-component';
import { ISortBy, IStoreCriteria } from '../store/store-support';

/** Default implementation of XtComponentModel */
export class XtBaseModel<T> implements XtComponentModel {
  /** Model signal for the currently selected value */
  valueSelected?: ModelSignal<T|null> | undefined;
  /** Model signal for sort criteria */
  sortBy?: ModelSignal<ISortBy<T>[]> | undefined;
  /** Model signal for filter criteria */
  filterBy?: ModelSignal<IStoreCriteria<T>[]> | undefined;

}
