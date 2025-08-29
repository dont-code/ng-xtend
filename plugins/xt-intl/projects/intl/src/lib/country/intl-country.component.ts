import { ChangeDetectionStrategy, Component, computed, OnInit, output, signal } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
  AutoCompleteUnselectEvent
} from 'primeng/autocomplete';
import countriests from 'countries-ts';
const { listCountries, searchCountries, alpha3Codes, getByAlpha3 } = countriests;

import { Country } from 'countries-ts';

@Component({
  selector: 'xt-intl-country',
  imports: [
    ReactiveFormsModule,
    AutoComplete
  ],
  templateUrl: './intl-country.component.html',
  styleUrl: './intl-country.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntlCountryComponent extends XtSimpleComponent<string> {
  selected= output<string|undefined>();

  listOfCountries=signal<Country[]> (listCountries());

  constructor() {
    super();
    // Converts the code to alpha3 codes
    this.toAlpha3(listCountries());
  }

  matchCountry($event: AutoCompleteCompleteEvent) {
    this.listOfCountries.set (searchCountries($event.query)
    );
  }

  selectionChange($event: AutoCompleteSelectEvent) {
    this.selected.emit($event.value.alpha3);
  }

  selectionCanceled($event: AutoCompleteUnselectEvent) {
    this.selected.emit(undefined);
  }

  override setupInputOutput () {
    this.outputsObject.valueSelected=this.selected;
  }

  toAlpha3 (list:Country[]): Country[] {
    for (const country of list) {
      country.alpha3=alpha3Codes[country.code]??country.code;
    }
    return list;
  }

  currentCountry = computed( () => {
    const val=this.displayValue();
    if (val!=null) {
      return getByAlpha3(val);
    } else return null;
  });
}
