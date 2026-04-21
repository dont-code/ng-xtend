import { InputSignal } from '@angular/core';
import { XtComponentInput } from '../xt-component';
import { ISortBy, IStoreCriteria } from '../store/store-support';

export class XtBaseInput implements XtComponentInput {
  valueSelected: InputSignal<any>|undefined;
}
