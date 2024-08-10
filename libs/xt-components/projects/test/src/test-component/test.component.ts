import { Component, signal } from '@angular/core';
import { XtCurrencyComponent, XtOtherComponent, XtContext, XtBaseContext } from 'xt-components';
import { NgComponentOutlet } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, XtCurrencyComponent, XtOtherComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  mainForm = this.builder.group ({
    currency: [123.5],
    other: ['']
  });

  myComponent = signal (XtCurrencyComponent);
  myComponentName = 'currency';
  
  constructor (protected builder:FormBuilder) {

  }

  switchComponent($event:Event) {

    if (($event.currentTarget as any).checked == true) {
      this.myComponent.set (XtOtherComponent);
      this.myComponentName = 'other';
    }
    else {
      this.myComponent.set (XtCurrencyComponent);
      this.myComponentName = 'currency';
    }
  }

  contextFor (inlineView:boolean, readOnly:boolean, subComponentName?:string): XtContext<any> {
    const displayType=readOnly?(inlineView?'INLINE_VIEW':'FULL_VIEW'):'FULL_EDITABLE';

    if (subComponentName != null)
      return new XtBaseContext<any> (displayType, this.mainForm, subComponentName);
    else {
        return new XtBaseContext<any> (displayType).setNonFormValue (this.mainForm.value[this.myComponentName as keyof typeof this.mainForm.value ]);
    }
    
  }
    
}
