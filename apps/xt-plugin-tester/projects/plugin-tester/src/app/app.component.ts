import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tooltip } from 'primeng/tooltip';
import { XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtMemoryStoreProvider, xtStoreManager } from 'xt-store';
import { TesterSessionService } from './core/tester-session.service';
import { ThemeService } from './core/theme.service';

type WizardStep = {
  path: string;
  label: string;
  desc: string;
  icon: string;
  /** Whether the route must match exactly (needed for the root path). */
  exact: boolean;
  /** Shows a check mark when the step is considered done. */
  done: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Tag, Toast, ConfirmDialog, Tooltip],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'test';

  protected readonly resolverService = inject(XtResolverService);
  protected readonly session = inject(TesterSessionService);
  protected readonly theme = inject(ThemeService);

  /** The three main steps of the tester workflow. */
  protected readonly steps = computed<WizardStep[]>(() => [
    {
      path: '/',
      label: 'Load plugins',
      desc: 'Fetch and inspect plugins',
      icon: 'pi pi-box',
      exact: true,
      done: this.session.hasRemotePlugins(),
    },
    {
      path: '/config',
      label: 'Configure',
      desc: 'Choose the document storage',
      icon: 'pi pi-cog',
      exact: false,
      done: this.session.configApplied(),
    },
    {
      path: '/test',
      label: 'Test',
      desc: 'Edit and view components',
      icon: 'pi pi-play',
      exact: false,
      done: this.session.testedComponent() != null,
    },
  ]);

  /** Secondary, more experimental pages, listed in the footer. */
  protected readonly advanced = [
    { path: '/form', label: 'Form editor' },
    { path: '/hierarchy', label: 'Hierarchy' },
  ];

  constructor() {
    // Register the plugin that is always available, then expose it as a builtin
    // entry in the tester session.
    registerDefaultPlugin(this.resolverService);
    xtStoreManager().setDefaultProvider(new XtMemoryStoreProvider());
    this.session.captureBuiltins();

    // Re-load the plugins remembered from the previous session (best effort).
    void this.session.restorePlugins();
  }

  protected pluginCountLabel(): string {
    const count = this.session.pluginCount();
    return count === 1 ? '1 plugin' : `${count} plugins`;
  }

  protected componentCountLabel(): string {
    const count = this.session.componentCount();
    return count === 1 ? '1 component' : `${count} components`;
  }
}
