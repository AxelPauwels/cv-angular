type EnvironmentType = 'development' | 'uat' | 'production';

export interface TolgeeConfig {
  apiUrl: `https://app.tolgee.io`;
  apiKey: `tg${string}_${string}`;
  cdnPrefix: `https://cdn.tolg.ee/${string}`;
}

export interface Environment {
  name: EnvironmentType;
  production: boolean;
  nodeVersion: string;
  gitCommit: string;
  buildDate: string;
  tolgee?: TolgeeConfig; // Local development only
  /** Maps each remote (micro-frontend) to its remoteEntry.json, from `public/` */
  federationManifest: string;
}
