import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
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
