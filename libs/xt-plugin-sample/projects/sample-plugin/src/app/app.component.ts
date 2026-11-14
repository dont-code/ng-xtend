import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { XtResolverService } from 'xt-components';
import { registerSamplePlugin } from '../../../sample/src/lib/register';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SampleTester';

  protected resolverService = inject (XtResolverService);

  constructor () {
    registerSamplePlugin(this.resolverService);
  }
}
