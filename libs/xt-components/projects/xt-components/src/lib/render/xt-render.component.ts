import { Component, computed, inject, input, model, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { XtComponent } from '../xt-component';
import { XtBaseContext, XtContext, XtDisplayMode } from '../xt-context';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { XtResolverService } from '../angular/xt-resolver.service';

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
  resolverService = inject(XtResolverService);

  componentType = input<Type<XtComponent<T>>> ();
  displayMode = input.required<XtDisplayMode> ();
  valueType = input<string> ();

  // Either we set the value directly
  value= model<T> ();
  // Or we are inside a Form
  formGroup=input<FormGroup>();
  subName= input<string>();

  constructor() {

  }

  context: Signal<XtContext<any>> = computed(() => {
    let form = this.formGroup();

    const ret= new XtBaseContext<any>(this.displayMode(), this.subName(), form);
    ret.valueType=this.valueType();
    if (!ret.isInForm()) {
      const subName = this.subName();
      const value = this.value();
      if ( (subName == null) || (value == null)) {
        ret.setDisplayValue(value);
      } else {
        ret.setDisplayValue(value[subName as keyof typeof value]);
      }
    }
    return ret as XtContext<T>;
  });

  type:Signal<Type<XtComponent<T>>|null> = computed( () => {
    //console.debug("Calculating type in XtRenderSubComponent");

    const type=this.componentType();
    if (type!=null) {
      console.debug('XtRender, using component set '+ type);
      return type;
    }

    const compFound= this.resolverService.findBestComponent(this.context());
    console.debug('XtRender, found component ',compFound.componentName);

    return compFound.componentClass;
  });

}
