import { Component, computed, ElementRef, input, model, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { XtComponent } from '../xt-component';
import { XtBaseContext, XtContext, XtDisplayMode } from '../xt-context';
import {
  FormControlName,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'xt-render',
  standalone: true,
  imports: [
    NgComponentOutlet,
    ReactiveFormsModule
  ],
  templateUrl: './xt-render.component.html',
  styleUrl: './xt-render.component.css'
})
export class XtRenderComponent<T> {

  componentType = input.required<Type<XtComponent<T>>> ();
  displayMode = input.required<XtDisplayMode> ();

  // Either we set the value directly
  value= model<T> ();
  formGroup=input<FormGroup>();
  subName= input<string>();

  constructor(private elementRef:ElementRef) {

  }

  context: Signal<XtContext<T>> = computed(() => {
    let form = this.formGroup();

    const ret= new XtBaseContext<T>(this.displayMode(), form, this.subName());
    if (!ret.isInForm()) ret.setNonFormValue(this.value());
    return ret;
  });
}
