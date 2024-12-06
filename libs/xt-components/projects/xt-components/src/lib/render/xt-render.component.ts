import { Component, computed, input, model, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { XtComponent } from '../xt-component';
import { XtBaseContext, XtContext, XtDisplayMode } from '../xt-context';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

/**
 * Offers a nice and easy to dynamically embed a component.
 * You set the type, the display mode, and either the value or the formgroup & subName to use.
 * XtRender will then instantiate the component, bind it to the value or form, and display it.
 */
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
  // Or we are inside a Form
  formGroup=input<FormGroup>();
  subName= input<string>();

  constructor() {

  }

  context: Signal<XtContext<T>> = computed(() => {
    let form = this.formGroup();

    const ret= new XtBaseContext<T>(this.displayMode(), this.subName(), form);
    if (!ret.isInForm()) ret.setDisplayValue(this.value());
    return ret as XtContext<T>;
  });
}
