import { Component, computed, inject, input, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { XtRenderComponent } from '../render/xt-render.component';
import { XtComponent } from '../xt-component';
import { XtBaseContext, XtDisplayMode } from '../xt-context';
import { XtRenderSubComponent } from '../render/xt-render-sub.component';
import { XtResolverService } from '../angular/xt-resolver.service';
import { xtTypeManager } from 'xt-type';
import { updateFormGroupWithValue } from '../type/type-helper';
/**
 * Component that can be used to bootstrap tests.
 * Just set the value and component type, and it will be injected in your test.
 */
@Component({
  selector:'test-host',
  standalone:true,
  imports: [CommonModule, XtRenderComponent],
  template: '<h1>Test Simple Component</h1> <xt-render [componentType]="type()" [displayMode]="displayMode()" [value]="value()" ></xt-render> '

})
export class HostTestSimpleComponent {
  /** Required input for the component type to render. */
  type = input.required<Type<XtComponent<any>>>();
  /** Input for the display mode. Defaults to FULL_VIEW. */
  displayMode = input<XtDisplayMode> ('FULL_VIEW');
  /** Input for the value to pass to the rendered component. */
  value = input<any|undefined> (undefined);

}

/**
 * Same as HostTestSimpleComponent but it includes everything in a form.
 * Just set the component type, the formGroup and the component  name, and your component will be run.
 * You can as well easily read and set the value.
 */
@Component({
  selector:'test-form-host',
  standalone:true,
  imports: [CommonModule, XtRenderComponent, ReactiveFormsModule],
  template: '<h1>Test Form Component</h1> <form [formGroup]="parentFormGroup"> <xt-render [componentType]="type()" displayMode="FULL_EDITABLE" [subName]="controlName()" [formGroup]="createdFormGroup()"></xt-render></form>'
})
export class HostTestFormComponent {
  /** Injected FormBuilder for creating form groups. */
  builder = inject(FormBuilder);
  /** Required input for the component type to render. */
  type = input.required<Type<XtComponent<any>>>();
  /** Required input for the form control name. */
  controlName = input.required<string>();
  /** Input for the form description object used to generate the form group. */
  formDescription = input<any> ({ });
  /** Input to provide an existing FormGroup directly. */
  formGroup= input<FormGroup>();

  /** The parent FormGroup that contains the component's form group. */
  parentFormGroup = this.builder.group<{ [keys: string]: AbstractControl }>({});

  /** Computed signal returning the created form group. */
  createdFormGroup = computed<FormGroup>(() => {
    return this.computeFormGroup();
  });

  /**
   * Computes the form group from the input, either using a provided form group or generating one from the form description.
   * @returns The created FormGroup
   */
  protected computeFormGroup ():FormGroup {
    const formGroup=this.formGroup();
    let createdFormGroup=formGroup??generateFormGroup(this.formDescription());
    this.parentFormGroup.addControl(this.controlName() ?? HostTestTypedFormComponent.CONTROL_NAME, createdFormGroup);
    return createdFormGroup;
  }

  /**
   * Patches the component's form control with a new value.
   * @param newVal - The value to patch
   */
  patchValue (newVal:any) {
    const patch:{[key:string]:any}={};
    patch[this.controlName()]=newVal;
    const createdFormGroup=this.createdFormGroup();
    createdFormGroup.patchValue(patch);
  }

  /**
   * Retrieves the current value from the component's form control.
   * @returns The current form value
   */
  retrieveValue (): any {
    const createdFormGroup=this.createdFormGroup();
    return createdFormGroup.value[this.controlName()];
  }
}

/**
 * Component that can be used to test your component based on the type it handles
 * Just set the type hierarchy to register, the value, and it will instantiate the right component in your plugin
 */
@Component({
  selector:'test-typed-host',
  standalone:true,
  imports: [CommonModule, XtRenderSubComponent],
  template: '<h1>Test Typed Component</h1> <xt-render-sub [context]="context()" ></xt-render-sub> '

})
export class HostTestTypedComponent {

  /** Input for the display mode. Defaults to FULL_VIEW. */
  displayMode = input<XtDisplayMode> ('FULL_VIEW');
  /** Input for the value to display. */
  value = input<any> ();
  /** Input for the value type string used for context creation. */
  valueType = input<string> ();

  /** Computed signal that creates the XtBaseContext from the input values. */
  context = computed( () => {
    const ret = new XtBaseContext(this.displayMode());

    ret.valueType=this.valueType();
    ret.setDisplayValue(this.value());
    return ret;
  });
}

/**
 * Same as HostTestSimpleComponent but it includes everything in a form.
 * Just set the component type, the formGroup and the component  name, and your component will be run.
 * You can as well easily read and set the value.
 */
@Component({
  selector:'test-typed-form-host',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, XtRenderSubComponent],
  template: '<h1>Test Typed Form Component</h1> <form [formGroup]="parentFormGroup"> <xt-render-sub [context]="subContext()"></xt-render-sub></form>'
})
export class HostTestTypedFormComponent implements OnInit {
  /** Injected FormBuilder for creating form groups. */
  builder = inject(FormBuilder);
  /** Injected resolver service for type resolution. */
  resolver = inject(XtResolverService);

  /** Default control name used if none is provided. */
  static readonly CONTROL_NAME = 'ForTest';

  /** Input for the value type string. */
  valueType = input<string>();
  /** Input for the form control name. */
  controlName = input<string>();
  /** Input for the form description used to generate the form group. */
  formDescription = input<any>(null);
  /** Input to provide an existing FormGroup directly. */
  formGroup = input<FormGroup>();

  /** The parent FormGroup that contains the component's form group. */
  parentFormGroup = this.builder.group<{ [keys: string]: AbstractControl }>({});

  /** Computed signal returning the created form group. */
  createdFormGroup = computed<FormGroup>(() => {
    return this.computeFormGroup();
  });

  ngOnInit(): void {
  }

  /**
   * Computes the form group from inputs, generating one from description or type if needed.
   * @returns The created FormGroup
   */
  protected computeFormGroup(): FormGroup {
    let createdFormGroup = null;
    const formGroup = this.formGroup();
    if (this.formDescription() != null) {
      createdFormGroup = formGroup ?? generateFormGroup(this.formDescription());
    } else {
      createdFormGroup = this.builder.group({});
      if (this.valueType() != null) {
        updateFormGroupWithValue(createdFormGroup, {}, this.valueType(), this.resolver.typeResolver);
      }
    }
    this.parentFormGroup.addControl(this.controlName() ?? HostTestTypedFormComponent.CONTROL_NAME, createdFormGroup);
    return createdFormGroup;
  }

  /** Computed signal that builds the XtBaseContext from form group and control name. */
  subContext= computed(()=> {
    const ctrlName = this.controlName();
    const createdFormGroup = this.createdFormGroup();
    let ret:XtBaseContext<any>|null = null;
    if (ctrlName==null){
      ret = new XtBaseContext('FULL_EDITABLE', HostTestTypedFormComponent.CONTROL_NAME, this.parentFormGroup);
    }
    else{
      ret = new XtBaseContext('FULL_EDITABLE', ctrlName, createdFormGroup);
    }
    ret.valueType=this.valueType();

    return ret;
  });

  /**
   * Patches a form control with a new value.
   * @param controlName - The name of the control to patch
   * @param newVal - The value to set
   */
  patchValue (controlName:string, newVal:any) {
    const patch:{[key:string]:any}={};
    patch[controlName]=newVal;
    this.createdFormGroup().patchValue(patch);
  }

  /**
   * Retrieves the current value from a form control.
   * @param controlName - The name of the control to read
   * @returns The current form value
   */
  retrieveValue (controlName:string): any {
    return this.createdFormGroup().value[controlName];
  }

}

/**
 * Generates a FormGroup from a form description object.
 * @param formDescription - The description object used to build the form group
 * @returns A FormGroup instance
 */
function generateFormGroup(formDescription: any):FormGroup {
  if (typeof formDescription != 'object') {
    throw new Error ('Form Description should be an object of values');
  }
  return generateFormControl(formDescription) as FormGroup;
}

/**
 * Recursively generates an AbstractControl from a form description value.
 * Handles null, arrays, objects (as FormGroup), and primitive values (as FormControl).
 * @param formDescription - The value to convert into a form control
 * @returns An AbstractControl instance
 */
function generateFormControl(formDescription: any): AbstractControl {

  if (formDescription==null) {
    return new FormControl(formDescription);
  }

  if (Array.isArray(formDescription)){
    const retArray = new FormArray<AbstractControl>([]);
    for (const val of formDescription) {
      retArray.push(generateFormControl(val), {emitEvent:false});
    }
    return retArray;
  }

  if ((typeof formDescription=='object')&&(!(formDescription instanceof Date))) {
    const retObject=new FormGroup({});
    for (const key of Object.keys(formDescription)) {
      retObject.addControl(key, generateFormControl(formDescription[key]));
    }
    return retObject;
  }
  return new FormControl(formDescription);
}
