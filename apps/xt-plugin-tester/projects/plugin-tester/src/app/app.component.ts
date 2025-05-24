import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { registerWebPlugin } from 'xt-plugin-web';
import { XtMemoryStoreProvider, xtStoreManager } from 'xt-store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'test';

  protected resolverService = inject (XtResolverService);

  constructor () {
    //Todo: Setup automatic registration of plugins
    //registerSamplePlugin(this.resolverService);
    registerDefaultPlugin(this.resolverService);
    registerWebPlugin(this.resolverService);

    xtStoreManager().setDefaultProvider(new XtMemoryStoreProvider());

  }

}
