import { Component, computed, inject } from '@angular/core';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { FormGroup } from '@angular/forms';
import { XtResolverService } from '../angular/xt-resolver.service';
import { XtContext } from '../xt-context';

/**
 * A composite XtComponent that manages a form group for its sub-elements.
 * Extends XtSimpleComponent to provide context-based form group management
 * and sub-context resolution for nested components.
 * Selector: not directly used (abstract base via template).
 */
@Component({
  standalone: true,
  imports: [],
  template: '',
  styleUrl: './xt-composite.component.css'
})
export class XtCompositeComponent<T = any> extends XtSimpleComponent<T> {

  /** Injected service for resolving components and type information. */
  resolverService = inject(XtResolverService);

  /**
   * Computes the local form group for this composite, creating one from the parent form group if it does not exist.
   * Overrides the base implementation to manage a dedicated form group for sub-elements.
   */
  override formGroupIfAny = computed<FormGroup | undefined> (() => {
    const context = this.context();
    if (context==null) return undefined;
    let ret= context.localFormGroup;
    if ((ret==null) && (context.parentFormGroup!=null) && (context.subName!=null)) {
      if (context.parentFormGroup.contains(context.subName)) {
        context.localFormGroup = context.parentFormGroup.get(context.subName) as FormGroup;
      } else {
        context.localFormGroup= new FormGroup ({});
        context.parentFormGroup.addControl(context.subName, context.localFormGroup);
      }
      ret=context.localFormGroup;
    }
    return ret;
  })

  /**
   * We need to create a new form group to manage the sub elements.
   */
  override formGroup = computed<FormGroup> (() => {
    const ret= this.formGroupIfAny();
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

  /**
   * Helper function to calculate the sub context for a named child element.
   * @param subName - The name of the sub-element
   * @param subType - Optional type hint for the sub-element
   * @returns The sub-context for the given child
   */
  subContext (subName:string, subType?:string):XtContext<any> {
    this.formGroupIfAny();  // Ensure the context is properly initialized
    return this.context().subContext(subName, subType, this.resolverService.typeResolver);
  }

}
