import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { XtResolverService } from 'xt-components';
import { registerSamplePlugin } from 'xt-plugin-sample';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'test';

  protected resolverService = inject (XtResolverService);

  constructor () {
    //Todo: Setup automatic registration of plugins
    registerSamplePlugin(this.resolverService);

  }

}
