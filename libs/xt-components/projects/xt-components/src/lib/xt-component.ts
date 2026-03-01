import { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import { XtContext } from './xt-context';
import { FormGroup } from '@angular/forms';

export type XtComponent<T=any> = {
    context: InputSignal<XtContext<T>>;

    inputsObject?: XtComponentInput;
    outputsObject?: XtComponentOutput;

    models?: ModelSignal<XtComponentModel|undefined>;
    inputs?: InputSignal<XtComponentInput>;
    outputs?: OutputEmitterRef<XtComponentOutput>;

    isInForm (): boolean;

    formControlName (): string | undefined;

    formGroup (): FormGroup;

    formGroupIfAny (): FormGroup | undefined;
}

export type XtOutputType = 'valueSelected';
export type XtInputType = 'valueSelected';
export type XtModelType = 'valueSelected' | 'sortBy' | 'filterBy';

export type XtComponentModel = {
  [key in XtModelType]: ModelSignal<any>|undefined;
}

export type XtComponentOutput = {
  [key in XtOutputType]: OutputEmitterRef<any>|undefined;
}

export type XtComponentInput = {
  [key in XtInputType]: InputSignal<any>|undefined;
}
