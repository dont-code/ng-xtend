import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreTestHelper, XtResolverService } from 'xt-components';
import { registerAgendaPlugin } from '../../../agenda/src/lib/register';
import { registerDefaultPlugin } from 'xt-plugin-default';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Agenda Tester';

  protected resolverService = inject (XtResolverService);

  constructor () {
    // Let's use the Test Store Helper for Web Images
    StoreTestHelper.ensureTestProviderOnly();
    registerDefaultPlugin(this.resolverService);
    registerAgendaPlugin(this.resolverService);
  }

}
