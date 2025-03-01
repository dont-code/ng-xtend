import { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { XtContext } from './xt-context';
import { FormGroup } from '@angular/forms';

export type XtComponent<T=any> = {
    context: InputSignal<XtContext<T>>;

    outputs?: OutputEmitterRef<XtComponentOutput>;

  /**
   * Does the component provides Output or not ?
   * @protected
   */
    hasOutputs?: boolean;

    isInForm (): boolean;

    formControlName (): string | undefined;

    formGroup (): FormGroup;

    formGroupIfAny (): FormGroup | undefined;
}

export type XtOutputType = 'valueSelected';

export type XtComponentOutput = {
  [key in XtOutputType]: Signal<any | null> |undefined;
}


