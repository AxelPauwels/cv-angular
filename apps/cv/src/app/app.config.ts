import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  PreloadAllModules,
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { TranslatedTitleStrategy } from './title/translated-title-strategy';
import {
  FEDERATION_MANIFEST_URL,
  inBrowserGraphqlInterceptor,
} from '@cv/shared-data-access';
import { provideI18n } from '@cv/shared-data-access-i18n';
import { provideContact } from '@cv/cv-data-access-contact';
import { provideAssistantConfig } from '@cv/showcase-data-access-assistant';
import { environment } from '../environments/environment';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    // every page its own, translated document title (see the strategy)
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    // the same manifest main.ts started federation with
    {
      provide: FEDERATION_MANIFEST_URL,
      useValue: environment.federationManifest,
    },
    provideI18n(environment.tolgee),
    provideContact({ web3formsAccessKey: environment.web3formsAccessKey }),
    // only a token: Hashbrown and Firebase load with the assistant page
    provideAssistantConfig(environment.assistant),
    // ng-valid, ng-invalid, ng-touched, ... on fields bound with [formField]
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
  ],
};
