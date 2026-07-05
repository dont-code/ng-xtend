import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
document.documentElement.classList.toggle('app-dark', prefersDark.matches);
prefersDark.addEventListener('change', (e) => {
  document.documentElement.classList.toggle('app-dark', e.matches);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
