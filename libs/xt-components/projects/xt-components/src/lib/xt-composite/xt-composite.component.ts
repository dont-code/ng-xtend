import { Component, computed, effect, OnInit, Signal } from '@angular/core';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  standalone: true,
  imports: [],
  template: '',
  styleUrl: './xt-composite.component.css'
})
export class XtCompositeComponent<T = any> extends XtSimpleComponent<T> {
  override formGroup = computed<FormGroup> (() => {
    const context = this.context();
    if (context==null) throw new Error ('No context while try to calculate FormGroup '+ this.componentDescriptor());
    let ret= context.localFormGroup;
    if ((ret==null) && (context.parentFormGroup!=null) && (context.formControlName!=null)) {
      ret= new FormGroup ({});
      context.parentFormGroup.addControl(context.formControlName, ret);
      context.localFormGroup=ret;
    } else {
      throw new Error ('No parent form or component name '+this.componentDescriptor());
    }
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

}
