import { CommonModule } from '@angular/common';
import { Component, computed, inject, Injector, OnInit, runInInjectionContext, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Money } from './xt-money.model';
import { XtCompositeComponent, XtRenderSubComponent } from 'xt-components';
import { InputNumberModule } from 'primeng/inputnumber';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lib-xt-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XtRenderSubComponent, InputNumberModule],
  templateUrl: './xt-money.component.html',
  styleUrl: './xt-money.component.css'
})
export class XtMoneyComponent extends XtCompositeComponent<Money> implements OnInit {
  injector = inject(Injector);

  // Force a recalculation of currency
  recalculate = signal<boolean>(true);

  currency= computed<string|undefined>( () => {
  //  console.debug("Calculating currency in XtMoneyComponent");
    this.recalculate();
    const value = this.context().value();
    if (value==null) return undefined;
    return value.currency;
  });

  amount = computed<number|undefined>(()=> {
    return this.context().displayValue()?.amount;
  })

  ngOnInit(): void {
//    console.debug("XtMoneyComponent ngOnInit");
    const amountCtrl = this.manageFormControl('amount');

      // Make sure the display is updated whenever the value change in the formgroup
    runInInjectionContext(this.injector, () => {
      if (amountCtrl?.parent!=null) {
        amountCtrl.parent.valueChanges.pipe(takeUntilDestroyed()).subscribe({
          next: value => {
            // Is the value a known currency ?
            if (Intl.supportedValuesOf('currency').indexOf(value.currency) > -1) {
              this.recalculate.set(!this.recalculate());
            }
          }
        });
      }
    });
  }
}
