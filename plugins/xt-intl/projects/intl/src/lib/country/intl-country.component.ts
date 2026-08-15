import { ChangeDetectionStrategy, Component, computed, OnInit, output, signal } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
  AutoCompleteUnselectEvent
} from 'primeng/autocomplete';
import { Country, getByAlpha3, listCountries, searchCountries } from './country-data';

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

  currentCountry = computed( () => {
    const val=this.displayValue();
    if (val!=null) {
      return getByAlpha3(val);
    } else return null;
  });
}
