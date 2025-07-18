import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { XtSimpleComponent } from 'xt-components';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
  AutoCompleteUnselectEvent
} from 'primeng/autocomplete';

@Component({
  selector: 'xt-sample-currency',
  standalone: true,
  imports: [CommonModule, InputNumberModule, ReactiveFormsModule, InputTextModule, AutoComplete],
  templateUrl: './intl-currency.component.html',
  styleUrl: './intl-currency.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntlCurrencyComponent extends XtSimpleComponent<string> {
  selected= output<string|undefined>();

  listOfCurrencies=signal<string[]> (Intl.supportedValuesOf('currency'));

  matchCurrency($event: AutoCompleteCompleteEvent) {
    this.listOfCurrencies.set (Intl.supportedValuesOf('currency').filter(currency => {
      return currency.indexOf($event.query) != -1;

    }));
  }

  selectionChange($event: AutoCompleteSelectEvent) {
    this.selected.emit($event.value);
  }

  selectionCanceled($event: AutoCompleteUnselectEvent) {
    this.selected.emit(undefined);
  }

  override setupInputOutput () {
    this.outputsObject.valueSelected=this.selected;
  }

}
