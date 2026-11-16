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
  /**
   * Web3Forms access key for the contact form (https://web3forms.com), from
   * the tokens file. It ships in the bundle (the browser sends it), which
   * Web3Forms allows: it only sends mail to the inbox it belongs to. It stays
   * out of the repo, though. Empty: the form shows that sending failed.
   */
  web3formsAccessKey: string;
}
