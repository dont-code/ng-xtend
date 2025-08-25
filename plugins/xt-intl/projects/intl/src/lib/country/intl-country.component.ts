import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
  AutoCompleteUnselectEvent
} from 'primeng/autocomplete';
import { countries, Country } from 'ts-countries';

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

  listOfCountries=signal<Country[]> (countries(false, true));

  matchCountry($event: AutoCompleteCompleteEvent) {
    this.listOfCountries.set ((countries(false, true) as Country[]).filter(country => {
      return (country.getName()?.indexOf($event.query)!=-1) ||
        (country.getNativeName()?.indexOf($event.query)!=-1) ||
        (country.getIsoAlpha3()?.indexOf($event.query)!=-1);

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
