import { InputSignal } from '@angular/core';
import { XtComponentInput } from '../xt-component';
import { ISortBy, IStoreCriteria } from '../store/store-support';

/** Default implementation of XtComponentInput */
export class XtBaseInput implements XtComponentInput {
  /** Input signal for the value selected by the user */
  valueSelected: InputSignal<any>|undefined;
}
