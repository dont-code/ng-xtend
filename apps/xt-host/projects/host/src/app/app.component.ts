import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Drawer } from 'primeng/drawer';
import { HostMenuComponent } from './host-menu/host-menu.component';
import { Toast } from 'primeng/toast';
import { ErrorHandlerService } from './error-handler/error-handler.service';
import { AppConfigService } from './shared/app-config/app-config.service';
import { ApplicationModelManagerService } from './application-model-manager/application-model-manager.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, Drawer, RouterLink, HostMenuComponent, Toast],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  leftDrawerVisible = signal<boolean>(false);
  appMgr = inject(ApplicationModelManagerService);

  constructor () {
  }

  invertSidePanelVisibility() {
    this.leftDrawerVisible.update( (oldValue) => {return !oldValue; });
  }

  onMenuClick() {
    if (this.leftDrawerVisible()) {
      this.invertSidePanelVisibility();
    }
  }
}
