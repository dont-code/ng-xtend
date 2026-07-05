import { ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const AppPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8f8fc',
          100: '#efeff8',
          200: '#dedff0',
          300: '#c4c7df',
          400: '#9aa0bf',
          500: '#747b9a',
          600: '#5a607a',
          700: '#42475b',
          800: '#2a2f3c',
          900: '#171a22',
          950: '#0b0d12'
        },
        content: {
          background: '{surface.50}'
        }
      },
      dark: {
        surface: {
          950: '#101118',
          900: '#171923',
          800: '#222737',
          700: '#333a52',
          600: '#48506c',
          500: '#66708c',
          400: '#97a0b8',
          300: '#c4cadb',
          200: '#e2e6f0',
          100: '#f3f5fa',
          50: '#fafbfe',
          0: '#ffffff'
        },
        content: {
          background: '{surface.950}'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),
    provideRouter(routes)]
};
