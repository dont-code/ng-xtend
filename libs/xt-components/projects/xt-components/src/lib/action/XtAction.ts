import { XtActionHandler, XtActionInfo } from 'xt-components';
import { signal } from '@angular/core';

export class XtAction<T> {
  name: string;
  info: XtActionInfo<T>;
  enabled = signal<boolean>(false);

  constructor(name: string, info: XtActionInfo<T>, enabled?: boolean) {
    this.name = name;
    this.info = info;
    if (enabled!=null) {
      this.enabled.set(enabled);
    }
  }
}
