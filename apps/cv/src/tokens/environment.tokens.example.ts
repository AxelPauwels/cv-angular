// Template for environment.tokens.ts (gitignored), which holds your local
// Tolgee credentials for the dev server. Copy it and fill in the values:
//   cp apps/cv/src/tokens/environment.tokens.example.ts apps/cv/src/tokens/environment.tokens.ts
// CI copies it as is, so builds and tests compile without the real file:
// keep it a valid module, with placeholders only, never a real key.
// Created before this file had WEB3FORMS or FIREBASE_ASSISTANT? Copy those
// exports into yours.

import { TolgeeConfig } from '../environments/environment.interface';

type TolgeeConst = {
  API_URL: TolgeeConfig['apiUrl'];
  API_KEY: TolgeeConfig['apiKey'];
  CDN_PREFIX: TolgeeConfig['cdnPrefix'];
};

const TOLGEE: TolgeeConst = {
  API_URL: 'https://app.tolgee.io',
  API_KEY: 'tgpak_', // add your key after the prefix
  CDN_PREFIX: 'https://cdn.tolg.ee/', // add your CDN id after the slash
} satisfies TolgeeConst;

export const TOKENS = {
  TOLGEE: TOLGEE,
};

// Web3Forms access key of the contact form's inbox (https://web3forms.com).
// A separate export: the production build imports only this one, so the
// Tolgee key never ends up in the bundle. CI fills it in from the
// WEB3FORMS_ACCESS_KEY secret (scripts/build-production.sh).
export const WEB3FORMS = {
  ACCESS_KEY: '', // paste your access key here
};

// The AI assistant's Firebase AI Logic keys (showcase). Public by design (they
// end up in the bundle, App Check guards their use), but kept out of the repo
// like the Web3Forms key, so secret scanners don't flag the Google API key.
// CI fills them in from the FIREBASE_API_KEY, FIREBASE_APP_ID and
// RECAPTCHA_SITE_KEY secrets (scripts/set-assistant-keys.mjs). Any empty
// value: the assistant page says it is switched off.
export const FIREBASE_ASSISTANT = {
  API_KEY: '', // Firebase console > Project settings > Your apps > Web app: apiKey
  APP_ID: '', // same place: appId
  RECAPTCHA_SITE_KEY: '', // Google Cloud > Fraud Defense: the score-based Web key
  // Local development only, never in CI: one App Check debug token for all your
  // browsers on localhost. Register it once (App Check > Apps > Web > Manage
  // debug tokens). Empty: each browser prints its own token to register.
  APP_CHECK_DEBUG_TOKEN: '',
};

// Note:
// API_KEY can be found:
// Tolgee > top right > User Settings > Project API Keys
// For example: tepar_thzt5n434v43g3y3nvh5mnl7g8b9vhgn0thob5twm4md2nmvxlrnw
//
// CDN_PREFIX can be found:
// Tolgee > select project > at left menu bar > developer Settings > Content Delivery
// For example: https://cdn.tolg.ee/3plo7j2b0d7f241917c33d0b5d50709f
