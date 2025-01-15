import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from '../../../default/src/lib/register';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DefaultTester';

  protected resolverService = inject (XtResolverService);

  constructor () {
    registerDefaultPlugin(this.resolverService);
  }

}
