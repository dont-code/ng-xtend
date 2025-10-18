import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { XtMessageHandler } from 'xt-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideRouter(routes),
    provideHttpClient(),
    MessageService,
    { provide: XtMessageHandler, useClass:MessageService}
  ]
};
