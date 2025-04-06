import { OutputEmitterRef } from '@angular/core';
import { XtComponentOutput } from '../xt-component';

export class XtBaseOutput implements XtComponentOutput {
  valueSelected: OutputEmitterRef<any> | undefined;

}
