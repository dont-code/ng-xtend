import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

/** localStorage key used to remember the user's theme choice. */
const STORAGE_KEY = 'xt-tester.theme';
/** Class applied to <html> to enable the dark theme (PrimeNG + Tailwind). */
const DARK_CLASS = 'app-dark';

/**
 * Tiny service handling the light/dark theme switch.
 *
 * The selected theme is applied by toggling the `.app-dark` class on the
 * document root, which is the selector PrimeNG is configured with. The choice
 * is persisted so it survives reloads.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly dark = signal<boolean>(this.initialPreference());

  constructor() {
    effect(() => {
      const isDark = this.dark();
      this.document.documentElement?.classList.toggle(DARK_CLASS, isDark);
      this.persist(isDark);
    });
  }

  /** Switch to the opposite theme. */
  toggle(): void {
    this.dark.update((value) => !value);
  }

  private initialPreference(): boolean {
    try {
      const stored = this.document.defaultView?.localStorage?.getItem(STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    } catch {
      return false;
    }
  }

  private persist(isDark: boolean): void {
    try {
      this.document.defaultView?.localStorage?.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      /* storage unavailable (private mode / non browser) - ignore */
    }
  }
}
