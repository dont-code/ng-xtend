import { XtOtherComponent } from './xt-other/xt-other.component';
import { XtResolverService } from 'xt-components';
import { XtCurrencyComponent } from './xt-currency/xt-currency.component';
import { XtMoneyComponent } from './xt-money/xt-money.component';

export function registerSamplePlugin (resolverService:XtResolverService):boolean {
    console.info ('Registering Sample Plugin');
    resolverService.registerPlugin ({
        name:'SamplePlugin',
        components: [
            {
                componentName:'XtCurrency',
                componentClass:XtCurrencyComponent,
                typesHandled: ['currency']
            },
            {
                componentName:'XtOther',
                componentClass:XtOtherComponent,
                typesHandled: ['other']
            },
            {
                componentName:'XtMoney',
                componentClass:XtMoneyComponent,
                typesHandled: ['money']
            },
        ],
        types:
            {
                money:{
                  amount: 'number',
                  currency: 'currency'
                },
                other:'string',
                currency:'string'
          }
    });
    return true;
}
