import { ModelSignal } from '@angular/core';
import { XtComponentModel } from '../xt-component';
import { ISortBy, IStoreCriteria } from '../store/store-support';

export class XtBaseModel<T> implements XtComponentModel {
  valueSelected: ModelSignal<T|null> | undefined;
  sortBy: ModelSignal<ISortBy<T>[]> | undefined;
  filterBy: ModelSignal<IStoreCriteria<T>[]> | undefined;

}
