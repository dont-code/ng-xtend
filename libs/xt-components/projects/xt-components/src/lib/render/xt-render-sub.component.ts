import { AfterViewInit, Component, computed, inject, input, output, Signal, Type, viewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XtContext } from '../xt-context';
import { XtComponent, XtComponentOutput } from '../xt-component';
import { XtResolverService } from '../angular/xt-resolver.service';
import { XtResolvedComponent } from '../xt-resolved-component';

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

  outputs = output<XtComponentOutput> ();
  hasOutputs:boolean = false;

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
    if ((instance != null) && (instance.hasOutputs) && (instance.outputs!=null)) {
      instance.outputs.subscribe ((out) => this.outputs.emit(out));
      this.hasOutputs=true;
    }

  }

}
