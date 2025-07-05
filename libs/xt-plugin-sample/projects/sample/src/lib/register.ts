import { XtResolverService } from 'xt-components';
import { SampleCurrencyComponent } from './currency/sample-currency.component';
import { SampleHelloComponent } from './hello/sample-hello.component';
import { SampleMoneyComponent } from './money/sample-money.component';

export function registerSamplePlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin Sample";
    console.info ('Registering '+pluginName);
    resolverService.registerPlugin ({
        name:pluginName,
        uriLogo:'pluginicon.png',
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
                sampleCurrency:'string',
                sampleMoney:{
                  amount: 'number',
                  currency: 'sampleCurrency'
                }
          }
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerSamplePlugin(resolverService);
}
