import { Component, computed, input, InputSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { XtContext } from '../xt-context';
import {XtComponent} from "../xt-component";


/**
 * An XtSimpleComponent just displays the given value or element in a form.
 * If you need to dynamically embed other XtComponents to display sub elements, then please use the XtCompositeComponent
 */
@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class XtSimpleComponent<T = any> implements XtComponent<T>{
  context = input.required<XtContext<T>>();

  isInForm = computed<boolean> ( () => {
    return this.context()?.isInForm()??false;
  });

  formControlNameIfAny = computed<string | undefined> (() => {
    return this.context()?.subName;
  });

  formGroupIfAny = computed<FormGroup | undefined> (() => {
    return this.context()?.formGroup();
  })

  formGroup = computed<FormGroup> (() => {
    const ret= this.context()?.formGroup();
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

  formControlName = computed<string> (() => {
    const ret = this.context()?.subName;
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

  componentDescriptor (): string {
    return this.context()?.valueType??'unknown';
  }

}
