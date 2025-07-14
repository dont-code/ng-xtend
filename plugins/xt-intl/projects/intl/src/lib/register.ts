import { XtResolverService } from 'xt-components';
import { IntlCurrencyComponent } from './currency/intl-currency.component';

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
                typesHandled: ['currency']
            }
        ],
        types:
          {
            currency:'string'
          }
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerInternationalPlugin(resolverService);
}
