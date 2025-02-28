import { signal, WritableSignal } from '@angular/core';
import { XtComponentOutput, XtOutputType } from '../xt-component';

export class XtBaseOutput implements XtComponentOutput {
  valueSelected: WritableSignal<any> | undefined;

  setNewOutput (name:XtOutputType, value:any):boolean {
    let ret=false;
    if (this[name] == null) {
      this[name] = signal<any>(value);
      ret=true;
    }else {
      this[name].set (value);
    }
    return ret;
  }
}
