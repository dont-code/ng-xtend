import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { XtComponentOutput, XtRenderComponent } from 'xt-components';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { IntlCurrencyComponent } from '../../../../intl/src/lib/currency/intl-currency.component';
import { IntlCountryComponent } from '../../../../intl/src/lib/country/intl-country.component';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [ReactiveFormsModule, XtRenderComponent, FormsModule, JsonPipe],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {

  builder = inject(FormBuilder);

  currencyForm = this.builder.group ({
    currency: ['EUR']
  });

  countryForm = this.builder.group ({
    country: ['FRA']
  });

  lastCurrencySelected=signal<string|undefined>(undefined)
  lastCountrySelected=signal<string|undefined>(undefined)

  constructor () {
  }

  protected readonly IntlCurrencyComponent = IntlCurrencyComponent;

  outputChanged(newValue: XtComponentOutput | null) {
    if( newValue?.valueSelected!=null) {
      newValue?.valueSelected.subscribe (selected => {
        this.lastCurrencySelected.set(selected);
      })
    }
  }

  countryChanged(newValue: XtComponentOutput | null) {
    if( newValue?.valueSelected!=null) {
      newValue?.valueSelected.subscribe (selected => {
        this.lastCountrySelected.set(selected);
      })
    }
  }

  protected readonly IntlCountryComponent = IntlCountryComponent;
}
