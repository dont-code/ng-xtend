import { Component, computed, input, InputSignal, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { XtContext } from '../xt-context';
import { XtComponent, XtComponentOutput } from '../xt-component';

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

  /**
   * Returns the component form name, which is for now the subName
   */
  componentNameInForm=computed<string> ( () => {
    return this.safelyGetSubName();
  });

  manageFormControl<T> (ctrlName:string): AbstractControl<T>|undefined {
    const formGroup = this.formGroupIfAny();
    if (formGroup==null) {
      // You can call manageFormControl even in not a form, it just get ignored
      //console.debug('FormGroup is undefined when declaring managedcontrol '+ctrlName);
      return undefined;
    } else {
      let ctrl=formGroup.get(ctrlName);
      if (ctrl==null) {
        ctrl = new FormControl<T|undefined>(undefined);
        formGroup.setControl(ctrlName, ctrl);
      }
      return ctrl;
    }
  }

  safelyGetSubName = computed<string>(() => {
    const ret = this.context()?.subName;
    if (ret==null) throw new Error ('This component has no name in the form '+this.componentDescriptor());
    return ret;
  });

  /**
   * Returns the form control name and create a form control behind the scene
   */
  formControlName = computed<string> (() => {
    const ret = this.safelyGetSubName();

    this.manageFormControl<any>(ret); // Creates the form control
    return ret;
  });

  formControl = computed<AbstractControl<any>> (() => {
    const subName = this.safelyGetSubName();
    const formControl= this.manageFormControl(subName);
    if (formControl==null) throw new Error ("Calling formControl for subName "+subName+" when none exist.");
    return formControl;
});

  componentDescriptor (): string {
    return "Component with type "+this.constructor.name+" with context "+this.context().toString();
  }

  getValue= computed (()=> {
    return this.context().value();
    });

  displayValue = computed (() => {
    return this.context().displayValue();
  });

}
