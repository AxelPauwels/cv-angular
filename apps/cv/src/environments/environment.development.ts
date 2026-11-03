import { TOKENS } from '../tokens/environment.tokens';
import { Environment } from './environment.interface';

export const environment: Environment = {
  name: 'development',
  production: false,
  // nodeVersion: process.version,
  // gitCommit: process.env.GIT_COMMIT || '',
  nodeVersion: 'todo',
  gitCommit: 'todo',
  buildDate: new Date().toISOString(),
  tolgee: {
    apiUrl: TOKENS.TOLGEE.API_URL,
    apiKey: TOKENS.TOLGEE.API_KEY,
    cdnPrefix: TOKENS.TOLGEE.CDN_PREFIX,
  },
};
