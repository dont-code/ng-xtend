import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { XtContext, XtCurrencyComponent, XtOtherComponent } from 'xt-components';

@Component({
  selector: 'app-xt-form-test',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, ButtonModule, JsonPipe],
  templateUrl: './xt-form-test.component.html',
  styleUrl: './xt-form-test.component.scss'
})
export class XtFormTestComponent {

  mainForm = this.builder.group ({
    currency: [''],
    other: ['']
  });

  constructor (protected builder:FormBuilder) {

  }

  validateForm () {
    this.mainForm.updateValueAndValidity();
  }

  currencyComponent () {
    return XtCurrencyComponent;
  }

  otherComponent () {
    return XtOtherComponent;
  }

  contextFor (subComponentName:string, inlineView:boolean, readOnly:boolean): XtContext {
    return {displayMode:inlineView?'INLINE_VIEW':'FULL_VIEW', readOnly, formGroup:this.mainForm};
  }


}
