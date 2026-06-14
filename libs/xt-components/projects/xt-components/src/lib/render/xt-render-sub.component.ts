import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  Signal,
  Type,
  viewChild
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XtContext } from '../xt-context';
import {
  XtComponent,
  XtComponentInput,
  XtComponentModel,
  XtComponentOutput,
  XtInputType, XtModelType,
  XtOutputType
} from '../xt-component';
import { XtResolverService } from '../angular/xt-resolver.service';
import { XtResolvedComponent } from '../xt-resolved-component';
import { XtBaseOutput } from '../output/xt-base-output';
import { XtBaseInput } from '../output/xt-base-input';
import { XtBaseModel } from '../output/xt-base-model';

/**
 * Dynamically render a component that will display the given subValue.
 * To be used only inside an XtSimpleComponent or XtCompositeComponent
 */
@Component({
  selector: 'xt-render-sub',
  standalone: true,
  imports: [
    NgComponentOutlet,
    ReactiveFormsModule
  ],
  templateUrl: './xt-render-sub.component.html',
  styleUrl: './xt-render-sub.component.css'
})
export class XtRenderSubComponent<T> implements AfterViewInit {
  /** The context containing display mode, form group, and value for the sub-component */
  context = input.required<XtContext<T>> ();
  /** Optional explicit component type to render */
  componentType = input<Type<XtComponent<T>>> ();

  /** Object holding the output emitters from the rendered sub-component */
  outputsObject = new XtBaseOutput();

  /** Inputs to pass through to the rendered sub-component */
  inputs = input<XtBaseInput>();
  /** Emits the outputs from the rendered sub-component */
  outputs = output<XtComponentOutput>();
  /** Model signals to pass through to the rendered sub-component */
  models = input<XtComponentModel> ();

  /** Reference to the NgComponentOutlet used to dynamically render the sub-component */
  outlet = viewChild.required(NgComponentOutlet);

  /** Injected resolver service for finding the best component */
  resolverService = inject(XtResolverService);

  /** Computed context that resolves references (if any) */
  realContext = computed(() => {
    let ret = this.context();
    /*if ((ret.isReference()) && (ret.referencedContext!=null)) {
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
