import { Environment } from './environment.interface';

export const environment: Environment = {
  name: 'production',
  production: true,
  // nodeVersion: process.version,
  // gitCommit: process.env.GIT_COMMIT || '',
  nodeVersion: 'todo',
  gitCommit: 'todo',
  buildDate: new Date().toISOString(),
  federationManifest: 'federation.manifest.json',
  // No tolgee key: CI pulls the translations with the TOLGEE_API_KEY secret
  // before building (scripts/build-production.sh)
};
