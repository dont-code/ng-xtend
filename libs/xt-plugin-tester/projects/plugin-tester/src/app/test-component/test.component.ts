import { Component, inject, signal, Type } from '@angular/core';
import { XtContext, XtBaseContext, XtComponent, XtResolverService } from 'xt-components';
import { NgComponentOutlet } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { XtCurrencyComponent, XtOtherComponent } from 'xt-sample-plugins';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, XtCurrencyComponent, XtOtherComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  mainForm = this.builder.group ({
    currency: ['EUR'],
    other: ['']
  });

  myComponentType = signal<Type<XtComponent> | null> (null);
  myComponentTypeName = 'currency';

  xtResolver = inject (XtResolverService);

  inlineContext = new XtBaseContext ('INLINE_VIEW');
  fullViewContext = new XtBaseContext ('FULL_VIEW');
  editContext = new XtBaseContext ('FULL_EDITABLE', this.mainForm);

  constructor (protected builder:FormBuilder) {
    this.inlineContext.setNonFormValue ('EUR');
    this.fullViewContext.setNonFormValue ('USD');
  }

  switchComponent($event:Event) {

    if (($event.currentTarget as any).checked == true) {
      this.myComponentTypeName = 'other';
    }
    else {
      this.myComponentTypeName = 'currency';
    }

    const found = this.xtResolver.findBestComponent (this.editContext, this.myComponentTypeName);
    this.myComponentType.set (found.componentClass);

  }

  contextFor (inlineView:boolean, readOnly:boolean, subComponentName?:string): XtContext<any> {
    const displayType=readOnly?(inlineView?'INLINE_VIEW':'FULL_VIEW'):'FULL_EDITABLE';

    if (subComponentName != null)
      return this.editContext.subContext (subComponentName);
    else if (displayType=='INLINE_VIEW'){
        return this.inlineContext;
    } else return this.fullViewContext;

  }

}
