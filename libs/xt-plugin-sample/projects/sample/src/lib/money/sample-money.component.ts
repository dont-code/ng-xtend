import { CommonModule } from '@angular/common';
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
import { ReactiveFormsModule } from '@angular/forms';
import { SampleMoney } from './sample-money.model';
import { XtCompositeComponent, XtRenderSubComponent } from 'xt-components';
import { InputNumberModule } from 'primeng/inputnumber';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'xt-sample-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XtRenderSubComponent, InputNumberModule],
  templateUrl: './sample-money.component.html',
  styleUrl: './sample-money.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class SampleMoneyComponent extends XtCompositeComponent<SampleMoney> implements OnInit {
  injector = inject(Injector);

  // Force a recalculation of currency
  recalculate = signal<boolean>(true);

  currency= computed<string|undefined>( () => {
  //  console.debug("Calculating currency in XtMoneyComponent");
    this.recalculate();
    const value = this.context().value();
    if (value?.currency==null) return undefined;

    return value.currency;
  });

  isValidCurrency= computed<boolean> ( () => {
    const cur=this.currency();
    if (cur==null) return false;
    if (Intl.supportedValuesOf('currency').indexOf(cur) > -1) {
      return true;
    }else
      return false;
  });

  amount = computed<number|undefined>(()=> {
    return this.context().displayValue()?.amount;
  })

  override ngOnInit(): void {
    super.ngOnInit();
//    console.debug("XtMoneyComponent ngOnInit");
    const amountCtrl = this.manageFormControl('amount');

      // Make sure the display is updated whenever the value change in the formgroup
    runInInjectionContext(this.injector, () => {
      if (amountCtrl?.parent!=null) {
        amountCtrl.parent.valueChanges.pipe(takeUntilDestroyed()).subscribe({
          next: value => {
            this.recalculate.set(!this.recalculate());
          }
        });
      }
    });
  }
}
