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
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        }
      },
      dark: {
        surface: {
          950: '#0b1220',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#cbd5e1',
          200: '#e5e7eb',
          100: '#f3f4f6',
          50: '#f8fafc',
          0: '#ffffff'
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
