import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { XtResolverService } from 'xt-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'test';

  protected primengConfig = inject (PrimeNGConfig);
  protected resolverService = inject (XtResolverService);

  constructor () {
    //Todo: Setup automatic registration of plugins

  }

  ngOnInit(): void {
    this.primengConfig.ripple=true;
  }
}
