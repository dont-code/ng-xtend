import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtMemoryStoreProvider, xtStoreManager } from 'xt-store';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, RouterLink, Toast],
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
    //registerWebPlugin(this.resolverService);

    xtStoreManager().setDefaultProvider(new XtMemoryStoreProvider());

  }

}
