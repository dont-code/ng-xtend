import { InputSignal } from '@angular/core';
import { XtComponentInput } from '../xt-component';

export class XtBaseInput implements XtComponentInput {
  valueSelected: InputSignal<any>|undefined;
}
