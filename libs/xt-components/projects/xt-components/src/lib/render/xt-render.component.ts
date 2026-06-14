import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  model,
  output, signal,
  Signal,
  Type,
  viewChild
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import {
  XtComponent,
  XtComponentModel,
  XtComponentOutput,
  XtInputType,
  XtModelType,
  XtOutputType
} from '../xt-component';
import { XtBaseContext, XtContext, XtDisplayMode } from '../xt-context';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { XtResolverService } from '../angular/xt-resolver.service';
import { XtResolvedComponent } from '../xt-resolved-component';
import { XtBaseOutput } from '../output/xt-base-output';
import { XtBaseInput } from '../output/xt-base-input';
import { isTypeReference } from 'xt-type';
import { XtBaseModel } from '../output/xt-base-model';

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
export class XtRenderComponent<T> implements AfterViewInit {
  /** Injected resolver service for finding the best component */
  resolverService = inject(XtResolverService);

  /** Optional explicit component type to render */
  componentType = input<Type<XtComponent<T>>> ();
  /** The display mode (e.g. EDIT, VIEW, etc.) */
  displayMode = input.required<XtDisplayMode> ();
  /** The value type identifier used for component resolution */
  valueType = input<string> ();

  /** The value to display/edit (used when not inside a form) */
  value= model<T> ();
  /** The parent form group (used when inside a form) */
  formGroup=input<FormGroup>();
  /** The sub-name within the form group */
  subName= input<string>();

  /** Object holding the output emitters from the rendered component */
  outputsObject = new XtBaseOutput();

  /** Inputs to pass through to the rendered component */
  inputs = input<XtBaseInput>();
  /** Emits the outputs from the rendered component */
  outputs = output<XtComponentOutput>();
  /** Model signals to pass through to the rendered component */
  models = input<XtComponentModel> ();

  /** Reference to the NgComponentOutlet used to dynamically render the component */
  outlet = viewChild.required(NgComponentOutlet);

  constructor() {

  }

  /** Computed context derived from display mode, form group, value, and value type */
  context: Signal<XtContext<any>> = computed(() => {
    let form = this.formGroup();

    const ret= new XtBaseContext<any>(this.displayMode(), this.subName(), form);
    ret.valueType=this.valueType();
    const typeInfo = this.resolverService.typeResolver.findType(ret.valueType);
    if( isTypeReference(typeInfo)) {
      ret.setReferenceInfo(typeInfo);
    }
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

  /** Computed context that resolves references (if any) */
  realContext = computed(() => {
    let ret = this.context();
    /*if ((ret.isReference())&& (ret.referencedContext!=null)) {
      ret = ret.referencedContext;
    }*/
    return ret;
  });


  /** Computed component type to render, resolved from the context if not explicitly set */
  type:Signal<Type<XtComponent<T>>|null> = computed( () => {
    //console.debug("Calculating type in XtRenderSubComponent");

    let type=this.componentType();
    let compFound:XtResolvedComponent|null = null;
    if (type==null) {
      //console.debug('XtRender, using component set '+ type);
      //compFound = this.resolverService.findComponentInfo (type);
    //} else {
      compFound= this.resolverService.findBestComponent(this.realContext());
      //console.debug('XtRender, found component ',compFound.componentName);
      type= compFound.componentClass;
    }

    return type??null;
  });

  /**
   * Transfers the input and outputs from the host to the rendered component
   */
  ngAfterViewInit() {
    const instance=this.outlet().componentInstance as XtComponent;
    if (instance?.outputsObject!=null) {
      let hasOneOutput = false;
      for (const key of Object.keys(instance.outputsObject) as XtOutputType[] ) {
        this.outputsObject[key] = instance.outputsObject[key];
        hasOneOutput=true;
      }
      if (hasOneOutput) {
        this.outputs.emit(this.outputsObject);
      }
    }

    const inputs = this.inputs();
    if ((inputs!=null) && (instance?.inputsObject!=null)) {
      for (const key of Object.keys(inputs) as XtInputType[] ) {
        instance.inputsObject[key] = inputs[key];
      }

    }

  }

}
