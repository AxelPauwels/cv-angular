import { TOKENS, WEB3FORMS } from '../tokens/environment.tokens';
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
};
