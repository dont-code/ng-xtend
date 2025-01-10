import { Component, inject } from '@angular/core';
import { XtRenderComponent } from 'xt-components';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SampleCurrencyComponent } from '../../../../sample/src/lib/currency/sample-currency.component';
import { SampleMoneyComponent } from '../../../../sample/src/lib/money/sample-money.component';
import { SampleHelloComponent } from '../../../../sample/src/lib/hello/sample-hello.component';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [ReactiveFormsModule, XtRenderComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  builder = inject(FormBuilder);

  currencyForm = this.builder.group ({
    currency: ['EUR']
  });

  moneyForm = this.builder.group ({
    money: this.builder.group(
      {
        currency: ['USD'],
        amount: [23.4]
      })
  });

  constructor () {
  }

  protected readonly SampleCurrencyComponent = SampleCurrencyComponent;
  protected readonly SampleMoneyComponent = SampleMoneyComponent;
  protected readonly SampleHelloComponent = SampleHelloComponent;
}
