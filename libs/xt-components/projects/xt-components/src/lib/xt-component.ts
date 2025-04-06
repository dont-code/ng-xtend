import { input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { XtContext } from './xt-context';
import { FormGroup } from '@angular/forms';

export type XtComponent<T=any> = {
    context: InputSignal<XtContext<T>>;

    inputs: XtComponentInput;
    outputs: XtComponentOutput;

    isInForm (): boolean;

    formControlName (): string | undefined;

    formGroup (): FormGroup;

    formGroupIfAny (): FormGroup | undefined;
}

export type XtOutputType = 'valueSelected';
export type XtInputType = 'valueSelected';

export type XtComponentOutput = {
  [key in XtOutputType]: OutputEmitterRef<any>|undefined;
}

export type XtComponentInput = {
  [key in XtInputType]: InputSignal<any>|undefined;
}
