import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { XtResolverService } from 'xt-components';
import { registerWorkflowSamplePlugin } from '../../../lib/src/lib/register';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'WorkflowSampleTester';

  protected resolverService = inject(XtResolverService);

  constructor() {
    registerWorkflowSamplePlugin(this.resolverService);
  }
}
