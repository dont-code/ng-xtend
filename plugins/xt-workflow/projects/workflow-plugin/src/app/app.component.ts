import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { EventType, Router, RouterOutlet } from '@angular/router';
import { XtResolverService } from 'xt-components';
import { StoreTestBed } from 'xt-store';
import { registerWorkflowPlugin } from '../../../workflow/src/lib/register';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

type ThemeMode = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, Button, Tooltip, Menu],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'DefaultTester';

  protected resolverService = inject (XtResolverService);
  protected router = inject (Router);
  protected subscriptions = new Subscription();

  currentPage = signal<string>('/');

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

  private readonly themeStorageKey = 'xt-workflow-theme-mode';
  private mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  constructor () {
    registerDefaultPlugin(this.resolverService);
    registerWorkflowPlugin(this.resolverService);

    StoreTestBed.ensureMemoryProviderOnly();
    this.subscriptions.add(this.router.events.subscribe((evt) => {
      if (evt.type==EventType.ActivationEnd) {
        if (evt.snapshot.url[0]?.path!=null)
          this.currentPage.set('/'+evt.snapshot.url[0].path);
        else
          this.currentPage.set('/');
      }
    }));

    this.applySavedThemeMode();
    this.mediaQueryList.addEventListener('change', () => {
      if (this.getStoredThemeMode() === 'system') {
        this.applyTheme();
      }
    });
  }

  setThemeMode(mode: ThemeMode) {
    localStorage.setItem(this.themeStorageKey, mode);
    this.applyTheme();
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

  ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }


}

