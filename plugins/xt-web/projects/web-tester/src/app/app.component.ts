import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XtResolverService } from 'xt-components';
import { registerWebPlugin } from 'xt-plugin-web';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WebTester';

  protected resolverService = inject (XtResolverService);

  constructor () {
    registerWebPlugin(this.resolverService);
  }

}
