import { InputSignal } from "@angular/core";
import { XtContext } from "./xt-context";
import { FormGroup } from "@angular/forms";

export type XtComponent<T=any> = {
    context: InputSignal<XtContext<T>> ;

    isInForm (): boolean;

    formControlName (): string | undefined;

    formGroup (): FormGroup;

    formGroupIfAny (): FormGroup | undefined;
}
