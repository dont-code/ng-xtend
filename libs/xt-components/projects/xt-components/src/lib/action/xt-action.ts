import { signal } from '@angular/core';
import { XtActionInfo } from '../plugin/xt-plugin-info';

/** Represents a registered action with its metadata and enabled state */
export class XtAction<T> {
  /** The unique name of the action */
  name: string;
  /** Metadata describing the action */
  info: XtActionInfo<T>;
  /** Signal indicating whether the action is currently enabled */
  enabled = signal<boolean>(false);

  /**
   * Creates a new XtAction instance
   * @param name - The unique name of the action
   * @param info - Metadata describing the action
   * @param enabled - Whether the action is initially enabled (defaults to false)
   */
  constructor(name: string, info: XtActionInfo<T>, enabled?: boolean) {
    this.name = name;
    this.info = info;
    if (enabled!=null) {
      this.enabled.set(enabled);
    }
  }
}
