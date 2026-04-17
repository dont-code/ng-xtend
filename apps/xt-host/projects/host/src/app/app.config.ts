import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { XtMessageHandler } from 'xt-components';
import { ErrorHandlerService } from './error-handler/error-handler.service';

const AppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    },colorScheme: {
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
          background: '{ surface.50}'
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
          background: '{ surface.950}'
        }

      }
    }
  },
  components: {
    button: {
      root: {
        borderRadius: '0.9rem',
        label: {
          fontWeight: '600'
        }
      }
    },
    card: {
      root: {
        borderRadius: '1.25rem'
      }
    },
    inputtext: {
      root: {
        borderRadius: '0.9rem'
      }
    },
    dropdown: {
      root: {
        borderRadius: '0.9rem'
      }
    },
    multiselect: {
      root: {
        borderRadius: '0.9rem'
      }
    },
    dialog: {
      root: {
        borderRadius: '1.25rem'
      }
    },
    datatable: {
      columnTitle: {
        fontWeight: '600'
      }
    },
    menu: {
      root: {
        borderRadius: '1rem'
      }
    },
    tooltip: {
      root: {
        borderRadius: '0.75rem'
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: '.app-dark'
        }
      },
      ripple: true
    }),
    provideRouter(routes),
    provideHttpClient(),
    MessageService,
    { provide: XtMessageHandler, useClass: ErrorHandlerService }
  ]
};
