// Template for environment.tokens.ts (gitignored), which holds your local
// Tolgee credentials for the dev server. Copy it and fill in the values:
//   cp apps/cv/src/tokens/environment.tokens.example.ts apps/cv/src/tokens/environment.tokens.ts
// CI copies it as is, so builds and tests compile without the real file:
// keep it a valid module, with placeholders only, never a real key.

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

// Note:
// API_KEY can be found:
// Tolgee > top right > User Settings > Project API Keys
// For example: tepar_thzt5n434v43g3y3nvh5mnl7g8b9vhgn0thob5twm4md2nmvxlrnw
//
// CDN_PREFIX can be found:
// Tolgee > select project > at left menu bar > developer Settings > Content Delivery
// For example: https://cdn.tolg.ee/3plo7j2b0d7f241917c33d0b5d50709f
