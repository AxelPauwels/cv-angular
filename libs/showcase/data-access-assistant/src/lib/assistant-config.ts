import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';

/**
 * How the assistant reaches Gemini: Firebase AI Logic with the Gemini
 * Developer API (free tier, Spark plan), guarded by App Check.
 *
 * None of this is a secret: the Firebase web config identifies the project
 * (the Gemini key stays on Firebase's proxy) and App Check makes sure only
 * this site can use it.
 */
export interface AssistantConfig {
  /** The web app's config from the Firebase console (project settings) */
  firebase: {
    apiKey: string;
    projectId: string;
    appId: string;
    authDomain?: string;
  };
  /** Score-based reCAPTCHA Enterprise site key registered for App Check */
  recaptchaSiteKey: string;
  /** A Gemini model on the free tier, e.g. `gemini-3.5-flash-lite` */
  model: string;
  /**
   * Local development only: an App Check debug token registered in the
   * Firebase console, or `true` to have the SDK print a new one in the console
   */
  appCheckDebugToken?: string | true;
}

/** `null`: no config, the assistant page explains it is switched off */
export const ASSISTANT_CONFIG = new InjectionToken<AssistantConfig | null>(
  'ASSISTANT_CONFIG',
  { factory: () => null }
);

/** Kept free of Hashbrown and Firebase imports, so app.config stays light */
export function provideAssistantConfig(
  config: AssistantConfig | null
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ASSISTANT_CONFIG, useValue: isComplete(config) ? config : null },
  ]);
}

function isComplete(config: AssistantConfig | null): boolean {
  return Boolean(
    config?.firebase.apiKey &&
    config.firebase.projectId &&
    config.firebase.appId &&
    config.recaptchaSiteKey &&
    config.model
  );
}
