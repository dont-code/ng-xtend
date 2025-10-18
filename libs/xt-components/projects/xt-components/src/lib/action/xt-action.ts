import { signal } from '@angular/core';
import { XtActionInfo } from '../plugin/xt-plugin-info';

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
