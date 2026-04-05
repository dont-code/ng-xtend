import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Drawer } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { HostMenuComponent } from './host-menu/host-menu.component';
import { Toast } from 'primeng/toast';
import { ApplicationModelManagerService } from './application-model-manager/application-model-manager.service';

type ThemeMode = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule, Drawer, RouterLink, HostMenuComponent, Toast, MenuModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  leftDrawerVisible = signal<boolean>(false);
  appMgr = inject(ApplicationModelManagerService);

  readonly themeOptions: MenuItem[] = [
    {
      label: 'Light',
      icon: 'pi pi-sun',
      command: () => this.setThemeMode('light')
    },
    {
      label: 'Dark',
      icon: 'pi pi-moon',
      command: () => this.setThemeMode('dark')
    },
    {
      label: 'System',
      icon: 'pi pi-desktop',
      command: () => this.setThemeMode('system')
    }
  ];

  private readonly themeStorageKey = 'xt-host-theme-mode';
  private mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.applySavedThemeMode();

    this.mediaQueryList.addEventListener('change', () => {
      if (this.getStoredThemeMode() === 'system') {
        this.applyTheme();
      }
    });
  }

  invertSidePanelVisibility() {
    this.leftDrawerVisible.update((oldValue) => !oldValue);
  }

  onMenuClick() {
    if (this.leftDrawerVisible()) {
      this.invertSidePanelVisibility();
    }
  }

  setThemeMode(mode: ThemeMode) {
    localStorage.setItem(this.themeStorageKey, mode);
    this.applyTheme();
  }

  getThemeMode(): ThemeMode {
    return this.getStoredThemeMode();
  }

  isDarkMode(): boolean {
    const mode = this.getStoredThemeMode();
    if (mode === 'dark') {
      return true;
    }

    if (mode === 'light') {
      return false;
    }

    return this.mediaQueryList.matches;
  }

  getThemeButtonIcon(): string {
    const mode = this.getStoredThemeMode();
    if (mode === 'system') {
      return 'pi pi-desktop';
    }

    return this.isDarkMode() ? 'pi pi-moon' : 'pi pi-sun';
  }

  getThemeButtonLabel(): string {
    const mode = this.getStoredThemeMode();
    if (mode === 'system') {
      return 'System';
    }

    return this.isDarkMode() ? 'Dark' : 'Light';
  }

  getThemeButtonSeverity(): 'secondary' | 'contrast' {
    return this.isDarkMode() ? 'contrast' : 'secondary';
  }

  private applySavedThemeMode() {
    if (!localStorage.getItem(this.themeStorageKey)) {
      localStorage.setItem(this.themeStorageKey, 'system');
    }

    this.applyTheme();
  }

  private applyTheme() {
    const mode = this.getStoredThemeMode();
    const useDark = mode === 'dark' || (mode === 'system' && this.mediaQueryList.matches);

    document.documentElement.classList.toggle('app-dark', useDark);
  }

  private getStoredThemeMode(): ThemeMode {
    return (localStorage.getItem(this.themeStorageKey) as ThemeMode | null) ?? 'system';
  }

  @HostListener('window:storage')
  onStorageChange() {
    this.applyTheme();
  }
}
