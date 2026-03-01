import { Component, inject, OnDestroy, signal } from '@angular/core';
import { EventType, Router, RouterOutlet } from '@angular/router';
import { StoreTestHelper, XtResolverService } from 'xt-components';
import { registerWorkflowPlugin } from '../../../workflow/src/lib/register';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, Button, Tooltip],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'DefaultTester';

  protected resolverService = inject (XtResolverService);
  protected router = inject (Router);
  protected subscriptions = new Subscription();

  currentPage = signal<string>('/');
  
  constructor () {
    registerDefaultPlugin(this.resolverService);
    registerWorkflowPlugin(this.resolverService);

    StoreTestHelper.ensureTestProviderOnly();
    this.subscriptions.add(this.router.events.subscribe((evt) => {
      if (evt.type==EventType.ActivationEnd) {
        if (evt.snapshot.url[0]?.path!=null)
          this.currentPage.set('/'+evt.snapshot.url[0].path);
        else
          this.currentPage.set('/');
      }
    }));
  }

  ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }


}

