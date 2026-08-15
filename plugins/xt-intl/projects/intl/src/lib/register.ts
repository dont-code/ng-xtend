import { XtResolverService } from 'xt-components';
import { IntlCurrencyComponent } from './currency/intl-currency.component';
import { CurrencyTypeHandler } from './currency/currency-type-handler';
import { IntlCountryComponent } from './country/intl-country.component';
import { CountryTypeHandler } from './country/country-type-handler';

export function registerInternationalPlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin International";
    console.info ('Registering '+pluginName);
    resolverService.registerPlugin ({
        name:pluginName,
        uriLogo:'pluginicon.png',
        components: [
            {
                componentName:'IntlCurrency',
                componentClass:IntlCurrencyComponent,
                typesHandled: ['currency'],
                outputs: ['valueSelected']
            },
            {
              componentName:'IntlCountry',
              componentClass:IntlCountryComponent,
              typesHandled: ['country'],
              outputs: ['valueSelected']
            }
        ],
        types:
          {
            currency:'string',
            country:'string'
          },
        typeHandlers: [
          {
            typesHandled: ['currency'],
            handlerClass: CurrencyTypeHandler
          },
          {
            typesHandled: ['country'],
            handlerClass: CountryTypeHandler
          }
        ]
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerInternationalPlugin(resolverService);
}
