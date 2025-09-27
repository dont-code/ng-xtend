import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
  signal
} from '@angular/core';
import { XtComponentOutput, XtCompositeComponent, XtRenderSubComponent, XtResolverService } from 'xt-components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputNumber } from 'primeng/inputnumber';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MoneyAmount } from '../money-handler/money-amount';

@Component({
  selector: 'xt-finance-amount',
  imports: [
    InputNumber,
    CurrencyPipe,
    XtRenderSubComponent,
    ReactiveFormsModule
  ],
  templateUrl: './finance-amount.component.html',
  styleUrl: './finance-amount.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceAmountComponent extends XtCompositeComponent<MoneyAmount> implements OnInit {
  isFixedCurrency=true;
  currency= signal<string|undefined>( undefined );

  override ngOnInit(): void {
    super.ngOnInit();

    // The same components support multiple types: money-amount (with currency selection), eur-amount or usd-amount
    let value=this.context().value();
    if ((this.context().valueType=='money-amount') || (this.context().valueType==null)) {
      this.isFixedCurrency=false;
      this.currency.set(value?.currency);
    }else if (this.context().valueType?.endsWith('-amount')) {
      this.isFixedCurrency=true;
      const currency=this.context().valueType?.substring(0,3).toUpperCase();
        // Enforce the currency if needed
      if (this.isInForm()) {
        if (value==null) {
          value=this.resolverService.findTypeHandlerOf(this.context()).handler?.createNew()??{};
          this.context().setFormValue(value, true);
        }else if (value.currency==null) {
          value.currency=currency;
          this.context().setFormValue(value, true);
        }
      }
      this.currency.set(currency);
    }
    this.manageFormControl('amount');
  }

  outputChanged($output:XtComponentOutput | null) {
    if ($output?.valueSelected!=null) {
      $output?.valueSelected.subscribe (selected => {
        this.currency.set(selected);
      });
    }

  }
}
