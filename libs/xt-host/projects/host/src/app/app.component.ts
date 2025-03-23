import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Drawer } from 'primeng/drawer';
import { MegaMenu } from 'primeng/megamenu';
import { HostMenuComponent } from './host-menu/host-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, Drawer, RouterLink, HostMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'test';
  leftDrawerVisible = signal<boolean>(false);

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
