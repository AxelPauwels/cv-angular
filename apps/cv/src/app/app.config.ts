import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18n } from '@cv/shared-data-access-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideI18n(),
  ],
};
