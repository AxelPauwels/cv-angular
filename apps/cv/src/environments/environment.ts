import { FIREBASE_ASSISTANT, WEB3FORMS } from '../tokens/environment.tokens';
import { Environment } from './environment.interface';

export const environment: Environment = {
  name: 'production',
  production: true,
  // nodeVersion: process.version,
  // gitCommit: process.env.GIT_COMMIT || '',
  nodeVersion: 'todo',
  gitCommit: 'todo',
  buildDate: new Date().toISOString(),
  // from the gitignored tokens file; CI writes the GitHub secret into it
  web3formsAccessKey: WEB3FORMS.ACCESS_KEY,
  federationManifest: 'federation.manifest.json',
  // No tolgee key: CI pulls the translations with the TOLGEE_API_KEY secret
  // before building (scripts/build-production.sh)
  assistant: {
    // the keys come from the gitignored tokens file (GitHub secrets in CI)
    firebase: {
      apiKey: FIREBASE_ASSISTANT.API_KEY,
      authDomain: 'axel-pauwels.firebaseapp.com',
      projectId: 'axel-pauwels',
      appId: FIREBASE_ASSISTANT.APP_ID,
    },
    recaptchaSiteKey: FIREBASE_ASSISTANT.RECAPTCHA_SITE_KEY,
    model: 'gemini-3.5-flash-lite',
  },
};
