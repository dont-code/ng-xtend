import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { XtSimpleComponent } from 'xt-components';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Select, SelectChangeEvent } from 'primeng/select';

@Component({
  selector: 'xt-dummy-currency',
  standalone: true,
  imports: [CommonModule, InputNumberModule, ReactiveFormsModule, InputTextModule, Select],
  templateUrl: './dummy-currency.component.html',
  styleUrl: './dummy-currency.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DummyCurrencyComponent extends XtSimpleComponent {
  currency= output<string|undefined>();

  currencies= [
    'EUR','USD','GBP','CHF','CAD','AUD','JPY'
  ];

  selectionChange($event: SelectChangeEvent) {
    this.currency.emit($event.value);
  }

  selectionCanceled() {
    this.currency.emit(undefined);
  }

  override setupInputOutput () {
    this.outputsObject.valueSelected=this.currency;
  }

}
