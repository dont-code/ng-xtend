import { Component, computed, inject, input, signal, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XtContext } from '../xt-context';
import { XtComponent } from '../xt-component';
import { XtResolverService } from '../angular/xt-resolver.service';

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
export class XtRenderSubComponent<T> {
  context = input.required<XtContext<T>> ();
  componentType = input<Type<XtComponent<T>>> ();

  resolverService = inject(XtResolverService);

  type:Signal<Type<XtComponent<T>>|null> = computed( () => {
    const type=this.componentType();
    if (type!=null) {
      return type;
    }

    const compFound= this.resolverService.findBestComponent(this.context());
    return compFound.componentClass;
  });
}
