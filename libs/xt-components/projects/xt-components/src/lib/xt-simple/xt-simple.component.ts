import { Component, computed, input, OnInit, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { XtContext } from '../xt-context';
import { XtComponent, XtComponentModel, XtComponentOutput } from '../xt-component';
import { XtBaseOutput } from '../output/xt-base-output';
import { XtBaseInput } from '../output/xt-base-input';

/**
 * An XtSimpleComponent just displays the given value or element in a form.
 * If you need to dynamically embed other XtComponents to display sub elements, then please use the XtCompositeComponent
 */
@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class XtSimpleComponent<T = any> implements XtComponent<T>, OnInit{
  /** Required input signal providing the XtContext for this component. */
  context = input.required<XtContext<T>>();
  /** Object holding the base output definitions for this component. */
  outputsObject = new XtBaseOutput();
  /** Object holding the base input definitions for this component. */
  inputsObject = new XtBaseInput();

  /** Output emitter that publishes the component's output map. */
  outputs=output<XtComponentOutput>();
  /** Input signal accepting model bindings for two-way data flow. */
  models=input<XtComponentModel>();

  /** Computed signal indicating whether this component is inside a reactive form. */
  isInForm = computed<boolean> ( () => {
    return this.context()?.isInForm()??false;
  });

  /** Computed signal returning the form control name, if any. */
  formControlNameIfAny = computed<string | undefined> (() => {
    return this.context()?.subName;
  });

  /** Computed signal returning the form group if one exists, or undefined. */
  formGroupIfAny = computed<FormGroup | undefined> (() => {
    return this.context()?.formGroup();
  })

  /** Computed signal returning the form group, throwing if none exists. */
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

  constructor() {
  }

  /**
   * Angular lifecycle hook. Sets up input/output bindings and emits outputs
   * if any output objects have been defined.
   */
  ngOnInit(): void {
    this.setupInputOutput();
    if (Object.keys(this.outputsObject).length > 0) {
      // At least one output has been defined
      this.outputs.emit(this.outputsObject);
    }
  }

  /**
   * Manages a form control within the component's form group, optionally creating it if it does not exist.
   * Can be safely called even when no form group is available.
   * @param ctrlName - The name of the form control
   * @param create - Whether to create the control if it does not exist (default true)
   * @returns The AbstractControl, or undefined if no form group is available
   */
  manageFormControl<T> (ctrlName:string, create:boolean=true): AbstractControl<T>|undefined {
    const formGroup = this.formGroupIfAny();
    if (formGroup==null) {
      // You can call manageFormControl even in not a form, it just get ignored
      //console.debug('FormGroup is undefined when declaring managedcontrol '+ctrlName);
      return undefined;
    } else {
      let ctrl=formGroup.get(ctrlName);
      if ((create) && (ctrl==null)) {
        ctrl = new FormControl<T|undefined>(undefined);
        formGroup.setControl(ctrlName, ctrl);
      }
      return ctrl??undefined;
    }
  }

  /** Computed signal that safely returns the sub-name, throwing if it is null. */
  safelyGetSubName = computed<string>(() => {
    const ret = this.context()?.subName;
    if (ret==null) throw new Error ('This component has no name in the form '+this.componentDescriptor());
    return ret;
  });

  /**
   * Computed signal returning the form control name for this component.
   */
  formControlName = computed<string> (() => {
    const ret = this.safelyGetSubName();

    //this.manageFormControl<any>(ret); // Don't create anything at this point. It's a computed value.
    return ret;
  });

  /** Computed signal that retrieves the existing AbstractControl for this component's sub-name. */
  formControl = computed<AbstractControl<any>> (() => {
    const subName = this.safelyGetSubName();
    const formControl= this.manageFormControl(subName, false);
    if (formControl==null) throw new Error ("Calling formControl for subName "+subName+" when none exist.");
    return formControl;
});

  /**
   * Returns a human-readable descriptor for this component.
   * @returns A string describing the component type and context
   */
  componentDescriptor (): string {
    return "Component with type "+this.constructor.name+" with context "+this.context().toString();
  }

  /** Computed signal exposing the raw value from the context. */
  getValue= computed (()=> {
    return this.context().value();
    });

  /** Computed signal exposing the display value from the context. */
  displayValue = computed (() => {
    return this.context().displayValue();
  });

  /**
   * This is where components can assign their output() and input() into the XtComponent inputs and outputs member
   * @protected
   */
  protected setupInputOutput () {
    // Nothing to do here
  }
}
