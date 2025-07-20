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
import { XtComponentOutput, XtCompositeComponent, XtRenderSubComponent } from 'xt-components';
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
  currency= signal<string|undefined>( undefined );

  amount = computed<number|undefined>(()=> {
    return this.context().displayValue()?.amount;
  })

  override ngOnInit(): void {
    super.ngOnInit();
    this.manageFormControl('amount');
    this.currency.set(this.context().value()?.currency);
  }

  outputChanged($output:XtComponentOutput | null) {
    if ($output?.valueSelected!=null) {
      $output?.valueSelected.subscribe (selected => {
        this.currency.set(selected);
      });
    }

  }
}
