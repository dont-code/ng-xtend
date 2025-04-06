import { AfterViewInit, Component, computed, inject, input, Signal, Type, viewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XtContext } from '../xt-context';
import { XtComponent, XtComponentInput, XtComponentOutput, XtInputType, XtOutputType } from '../xt-component';
import { XtResolverService } from '../angular/xt-resolver.service';
import { XtResolvedComponent } from '../xt-resolved-component';
import { XtBaseOutput } from '../output/xt-base-output';
import { XtBaseInput } from '../output/xt-base-input';

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
  context = input.required<XtContext<T>> ();
  componentType = input<Type<XtComponent<T>>> ();

  outputs =new XtBaseOutput() as XtComponentOutput;
  inputs = new XtBaseInput() as XtComponentInput;

  outlet = viewChild.required(NgComponentOutlet);

  resolverService = inject(XtResolverService);

  type:Signal<Type<XtComponent<T>>|null> = computed( () => {
    //console.debug("Calculating type in XtRenderSubComponent");

    let type=this.componentType();
    let compFound:XtResolvedComponent|null = null;
    if (type==null) {
      //console.debug('XtRender, using component set '+ type);
      //compFound = this.resolverService.findComponentInfo (type);
    //} else {
      compFound= this.resolverService.findBestComponent(this.context());
      //console.debug('XtRender, found component ',compFound.componentName);
      type= compFound.componentClass;
    }

    return type??null;

  });

  ngAfterViewInit() {
    const instance=this.outlet().componentInstance as XtComponent;
    if (instance?.outputs!=null) {
      for (const key of Object.keys(instance.outputs) as XtOutputType[] ) {
        this.outputs[key] = instance.outputs[key];
      }
    }
    if (instance?.inputs!=null) {
      for (const key of Object.keys(instance.inputs) as XtInputType[] ) {
        this.inputs[key] = instance.inputs[key];
      }

    }

  }

}
