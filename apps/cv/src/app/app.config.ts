import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18n } from '@cv/shared-data-access-i18n';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideI18n(environment.tolgee),
  ],
};
