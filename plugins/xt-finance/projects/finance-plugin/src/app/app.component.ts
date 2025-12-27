import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreTestHelper, XtResolverService } from 'xt-components';
import { registerFinancePlugin } from '../../../finance/src/lib/register';
import { DummyCurrencyComponent } from './dummy-currency/dummy-currency.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Finance Tester';

  protected resolverService = inject (XtResolverService);

  constructor () {
    // Let's use the Test Store Helper for Web Images
    StoreTestHelper.ensureTestProviderOnly();
    // Add the currency plugin to allow test
    this.resolverService.registerPlugin({
      name:'dummy-currency',
      components:[{
        componentName:'DummyCurrency',
        componentClass: DummyCurrencyComponent,
        typesHandled:['currency']
      }],
      types: {
        currency: 'string'
      }
    });

    registerFinancePlugin(this.resolverService);
  }

}
