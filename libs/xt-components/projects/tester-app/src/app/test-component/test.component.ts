import { ChangeDetectionStrategy, Component, inject, signal, Type } from '@angular/core';
import { XtBaseContext, XtComponent, XtContext, XtResolverService } from 'xt-components';
import { NgComponentOutlet } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  editContext = new XtBaseContext ('FULL_EDITABLE', undefined, this.mainForm);

  constructor (protected builder:FormBuilder) {
    this.inlineContext.setDisplayValue ('EUR');
    this.fullViewContext.setDisplayValue ('USD');
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
