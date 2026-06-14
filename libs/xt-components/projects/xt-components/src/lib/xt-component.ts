import { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import { XtContext } from './xt-context';
import { FormGroup } from '@angular/forms';

/**
 * Interface for ng-extended components. Defines the contract all XtComponents must implement,
 * including context handling, input/output bindings, and form integration.
 */
export type XtComponent<T=any> = {
    context: InputSignal<XtContext<T>>;

    inputsObject?: XtComponentInput;
    outputsObject?: XtComponentOutput;
    modelsObject?: XtComponentModel;

    models?: InputSignal<XtComponentModel|undefined>;
    inputs?: InputSignal<XtComponentInput>;
    outputs?: OutputEmitterRef<XtComponentOutput>;

    isInForm (): boolean;

    formControlName (): string | undefined;

    formGroup (): FormGroup;

    formGroupIfAny (): FormGroup | undefined;
}

/** Possible output types emitted by an XtComponent. */
export type XtOutputType = 'valueSelected';
/** Possible input types accepted by an XtComponent. */
export type XtInputType = 'valueSelected';
/** Possible model types for two-way binding on an XtComponent. */
export type XtModelType = 'valueSelected' | 'sortBy' | 'filterBy';

/** Defines the model signals available for two-way binding on a component. */
export type XtComponentModel = {
  [key in XtModelType]?: ModelSignal<any>|undefined;
}

/** Defines the output emitter map for a component. */
export type XtComponentOutput = {
  [key in XtOutputType]: OutputEmitterRef<any>|undefined;
}

/** Defines the input signal map for a component. */
export type XtComponentInput = {
  [key in XtInputType]: InputSignal<any>|undefined;
}
