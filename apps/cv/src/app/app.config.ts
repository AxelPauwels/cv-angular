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
import {
  FEDERATION_MANIFEST_URL,
  inBrowserGraphqlInterceptor,
} from '@cv/shared-data-access';
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
    // the same manifest main.ts started federation with
    {
      provide: FEDERATION_MANIFEST_URL,
      useValue: environment.federationManifest,
    },
    provideI18n(environment.tolgee),
  ],
};
