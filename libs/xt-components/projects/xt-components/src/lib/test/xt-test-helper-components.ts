import { Component, computed, inject, input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { XtRenderComponent } from '../render/xt-render.component';
import { XtComponent } from '../xt-component';
import { XtBaseContext, XtDisplayMode } from '../xt-context';
import { XtRenderSubComponent } from '../render/xt-render-sub.component';
import { XtResolverService } from '../angular/xt-resolver.service';

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
  type = input.required<Type<XtComponent<any>>>();
  displayMode = input<XtDisplayMode> ('FULL_VIEW');
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
  template: '<h1>Test Form Component</h1> <form [formGroup]="computedFormGroup()"> <xt-render [componentType]="type()" displayMode="FULL_EDITABLE" [subName]="controlName()" [formGroup]="computedFormGroup()"></xt-render></form>'
})
export class HostTestFormComponent {
  builder = inject(FormBuilder);
  type = input.required<Type<XtComponent<any>>>();
  controlName = input.required<string>();
  // You can send the description to be used in a FormBuilder to create the formgroup;
  formDescription = input<any> ({ });
  // Or set the FormGroup directly
  formGroup= input<FormGroup>();

  createdFormGroup: FormGroup|null = null;

  computedFormGroup () {
    if( this.createdFormGroup==null) {
      const formGroup=this.formGroup();
      this.createdFormGroup=formGroup??this.builder.group(this.formDescription());
    }
    return this.createdFormGroup;
  }

  patchValue (newVal:any) {
    const patch:{[key:string]:any}={};
    patch[this.controlName()]=newVal;
    if (this.createdFormGroup!=null)
      this.createdFormGroup.patchValue(patch);
    else throw new Error ("FormGroup not yet created. Did you set formGroup or formDescription property ?");
  }

  retrieveValue (): any {
    if (this.createdFormGroup!=null)
      return this.createdFormGroup.value[this.controlName()];
    else throw new Error ("FormGroup not yet created. Did you set formGroup or formDescription property ?");
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

  displayMode = input<XtDisplayMode> ('FULL_VIEW');
  value = input<any> ();
  valueType = input<string> ();

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
export class HostTestTypedFormComponent {
  builder = inject(FormBuilder);
  resolver = inject(XtResolverService);

  static readonly CONTROL_NAME='ForTest';

  valueType = input<string> ();
  controlName = input<string>();
  // You can send the description to be used in a FormBuilder to create the formgroup;
  formDescription = input<any> ({ });
  // Or set the FormGroup directly
  formGroup= input<FormGroup>();

  parentFormGroup = this.builder.group<{[keys:string]: AbstractControl}>({});

  createdFormGroup: FormGroup|null = null;

  computedFormGroup = computed(() =>{
    if( this.createdFormGroup==null) {
      const formGroup=this.formGroup();
      this.createdFormGroup=formGroup??this.builder.group(this.formDescription());
      this.parentFormGroup.addControl(this.controlName()??HostTestTypedFormComponent.CONTROL_NAME, this.createdFormGroup);
    }
    return this.createdFormGroup;
  });

  subContext = computed( () => {
    this.computedFormGroup(); // Make sure the subformgroups are created

    const ctrlName = this.controlName();
    let ret:XtBaseContext<any>|null = null;
    if (ctrlName==null){
      ret = new XtBaseContext('FULL_EDITABLE', HostTestTypedFormComponent.CONTROL_NAME, this.parentFormGroup);
    }
    else{
      ret = new XtBaseContext('FULL_EDITABLE', ctrlName, this.createdFormGroup!);
    }
    ret.valueType=this.valueType();

    return ret;
  });

  patchValue (controlName:string, newVal:any) {
    const patch:{[key:string]:any}={};
    patch[controlName]=newVal;
    this.computedFormGroup().patchValue(patch);
  }

  retrieveValue (controlName:string): any {
    return this.computedFormGroup().value[controlName];
  }
}
