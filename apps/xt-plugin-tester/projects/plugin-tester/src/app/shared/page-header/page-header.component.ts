import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Consistent page header used by every tester page: an icon, a title and an
 * optional subtitle, with a projected slot on the right for page level actions.
 *
 * Usage:
 * ```
 * <app-page-header icon="pi pi-box" title="Title" subtitle="...">
 *   <p-button ... />
 * </app-page-header>
 * ```
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="mb-6 flex flex-wrap items-center gap-4">
      @if (icon()) {
        <span
          class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <i [class]="icon() + ' text-2xl'"></i>
        </span>
      }
      <div class="min-w-0">
        <h1 class="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-50">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ subtitle() }}</p>
        }
      </div>
      <div class="ml-auto flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
}
