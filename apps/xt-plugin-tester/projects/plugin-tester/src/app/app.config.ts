import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { XtMessageHandler } from 'xt-components';
import { ErrorHandlerService } from './error-handler/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          // The ThemeService toggles this class on <html> to switch themes.
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideRouter(routes),
    provideHttpClient(),
    MessageService,
    ConfirmationService,
    { provide: XtMessageHandler, useClass: ErrorHandlerService },
  ],
};
