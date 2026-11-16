import {
  FIREBASE_ASSISTANT,
  TOKENS,
  WEB3FORMS,
} from '../tokens/environment.tokens';
import { Environment } from './environment.interface';

export const environment: Environment = {
  name: 'development',
  production: false,
  // nodeVersion: process.version,
  // gitCommit: process.env.GIT_COMMIT || '',
  nodeVersion: 'todo',
  gitCommit: 'todo',
  buildDate: new Date().toISOString(),
  // from the gitignored tokens file; CI writes the GitHub secret into it
  web3formsAccessKey: '9fbca933-2c9f-4416-98ed-79647ba94f78', // Just for testing purposes
  // the remotes served locally (cv-mfe: `nx serve cv-mfe` on port 4300)
  federationManifest: 'federation.manifest.localhost.json',
  tolgee: {
    apiUrl: TOKENS.TOLGEE.API_URL,
    apiKey: TOKENS.TOLGEE.API_KEY,
    cdnPrefix: TOKENS.TOLGEE.CDN_PREFIX,
  },
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
    // the shared debug token from the tokens file; without one, each browser
    // prints its own in the console to register in App Check > Manage debug tokens
    appCheckDebugToken: FIREBASE_ASSISTANT.APP_CHECK_DEBUG_TOKEN || true,
  },
};
