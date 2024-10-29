import { Component, computed, input, InputSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { XtContext } from '../xt-context';
import {XtComponent} from "../xt-component";


@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class XtSimpleComponent<T = any> implements XtComponent<T>{
  context = input<XtContext<T> | undefined>();

  isInForm = computed<boolean> ( () => {
    return this.context()?.isInForm()??false;
  });

  formControlNameIfAny = computed<string | undefined> (() => {
    return this.context()?.formControlName;
  });

  formGroupIfAny = computed<FormGroup | undefined> (() => {
    return this.context()?.parentFormGroup;
  })

  formGroup = computed<FormGroup> (() => {
    const ret= this.context()?.formGroup();
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

  formControlName = computed<string> (() => {
    const ret = this.context()?.formControlName;
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

  componentDescriptor (): string {
    return this.context()?.valueType??'unknown';
  }

}
