import { XtResolverService } from 'xt-components';
import { MoneyAmountHandler } from './money-handler/money-amount-handler';
import { FinanceAmountComponent } from './finance-amount/finance-amount.component';

export function registerFinancePlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin Finance";
    console.info ('Registering '+pluginName);
    resolverService.registerPlugin ({
        name:pluginName,
        uriLogo:'pluginicon.png',
        components: [
            {
              componentName:'FinanceAmount',
              componentClass:FinanceAmountComponent,
              typesHandled: ['money-amount','eur-amount','usd-amount'],
            }
        ],
      types: {
        "money-amount":{
          numericField: 'amount',
          children:{
            currency:'currency',
            amount:'number'
          }
        },
        "eur-amount":{
          numericField: 'amount',
          children: {
            currency: 'currency',
            amount: 'number'
          }
        },
        "usd-amount":{
          numericField: 'amount',
          children: {
            currency: 'currency',
            amount: 'number'
          }
        }
      }
      ,typeHandlers:[
        {
          typesHandled: ['money-amount', 'eur-amount', 'usd-amount'],
          handlerClass: MoneyAmountHandler
        }
      ]

    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerFinancePlugin(resolverService);
}
