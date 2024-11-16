import { Component, computed, effect, inject, OnInit, Signal } from '@angular/core';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { FormControl, FormGroup } from '@angular/forms';
import { XtResolverService } from '../angular/xt-resolver.service';

@Component({
  standalone: true,
  imports: [],
  template: '',
  styleUrl: './xt-composite.component.css'
})
export class XtCompositeComponent<T = any> extends XtSimpleComponent<T> {

  resolverService = inject(XtResolverService);
  /**
   * We need to create a new form group to manage the sub elements.
   */
  override formGroup = computed<FormGroup> (() => {
    const context = this.context();
    if (context==null) throw new Error ('No context while try to calculate FormGroup '+ this.componentDescriptor());
    let ret= context.localFormGroup;
    if ((ret==null) && (context.parentFormGroup!=null) && (context.subName!=null)) {
      ret= new FormGroup ({});
      context.parentFormGroup.addControl(context.subName, ret);
      context.localFormGroup=ret;
    } else {
      throw new Error ('No parent form or component name '+this.componentDescriptor());
    }
    if (ret==null) throw new Error ('No form groups in this component of type '+this.componentDescriptor());
    return ret;
  });

  /**
   * Helper function to calculate the sub context
   * @param subName
   */
  subContext (subName:string) {
    return this.context()?.subContext(subName, this.resolverService.typeResolver??undefined);
  }
}
