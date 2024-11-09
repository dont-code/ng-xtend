import { Component, computed, input, model, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { XtComponent } from '../xt-component';
import { XtBaseContext, XtContext, XtDisplayMode } from '../xt-context';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'xt-render',
  standalone: true,
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './xt-render.component.html',
  styleUrl: './xt-render.component.css'
})
export class XtRenderComponent<T> {

  componentType = input.required<Type<XtComponent<T>>> ();
  displayMode = input.required<XtDisplayMode> ();

  // Either we set the value directly
  value= model<T> ();
  // Or it's in edit mode using a formgroup
  form = input<FormGroup> ();
  name = input<string> ();

  context: Signal<XtContext<T>> = computed(() => {
    const ret= new XtBaseContext<T>(this.displayMode(), this.form(), this.name());
    if (!ret.isInForm()) ret.setNonFormValue(this.value());
    return ret;
  });
}
