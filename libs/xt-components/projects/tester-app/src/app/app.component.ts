import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { XtResolverService } from 'xt-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'test';

  protected resolverService = inject (XtResolverService);

  constructor () {
    //Todo: Setup automatic registration of plugins

  }
}
