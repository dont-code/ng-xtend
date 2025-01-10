import { XtResolverService } from 'xt-components';
import { SampleCurrencyComponent } from './currency/sample-currency.component';
import { SampleHelloComponent } from './hello/sample-hello.component';
import { SampleMoneyComponent } from './money/sample-money.component';

export function registerSamplePlugin (resolverService:XtResolverService):boolean {
    console.info ('Registering Sample Plugin');
    resolverService.registerPlugin ({
        name:'SamplePlugin',
        components: [
            {
              componentName:'SampleHello',
              componentClass:SampleHelloComponent,
              typesHandled: ['sampleHello']
            },
            {
                componentName:'SampleCurrency',
                componentClass:SampleCurrencyComponent,
                typesHandled: ['sampleCurrency']
            },
            {
                componentName:'SampleMoney',
                componentClass:SampleMoneyComponent,
                typesHandled: ['sampleMoney']
            },
        ],
        types:
            {
                sampleHello:'string',
                sampleMoney:{
                  amount: 'number',
                  currency: 'sampleCurrency'
                },
                sampleCurrency:'string'
          }
    });
    return true;
}
