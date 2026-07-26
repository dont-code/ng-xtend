import { OutputEmitterRef } from '@angular/core';
import { XtComponentOutput } from '../xt-component';

/** Default implementation of XtComponentOutput */
export class XtBaseOutput implements XtComponentOutput {
  /** Output emitter for when a value is selected */
  valueSelected: OutputEmitterRef<any> | undefined;
  /** Output emitter for when an edit action is requested */
  editRequested: OutputEmitterRef<any> | undefined;

}
