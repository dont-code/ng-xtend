import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { XtBaseContext, XtContext } from 'xt-components';
import { SampleHelloComponent, SampleCurrencyComponent } from 'xt-plugin-sample';

@Component({
  selector: 'app-xt-form-plugin-tester',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, ButtonModule, JsonPipe],
  templateUrl: './xt-form-test.component.html',
  styleUrl: './xt-form-test.component.scss'
})
export class XtFormTestComponent {

  mainForm = this.builder.group ({
    currency: ['EUR'],
    other: ['']
  });

  constructor (protected builder:FormBuilder) {

  }

  validateForm () {
    this.mainForm.updateValueAndValidity();
  }

  currencyComponent () {
    return SampleCurrencyComponent;
    //return null;
  }

  otherComponent () {
    return SampleHelloComponent;
  }

  contextFor (subComponentName:string, inlineView:boolean, readOnly:boolean): XtContext<any> {
    const displayType=readOnly?(inlineView?'INLINE_VIEW':'FULL_VIEW'):'FULL_EDITABLE';
    return new XtBaseContext(displayType, subComponentName, this.mainForm);
  }


}
