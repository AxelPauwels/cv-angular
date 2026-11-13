/** An installed framework or tool, from tools/build-info/generate.mjs */
export interface PackageVersion {
  /** e.g. Framework, UI, Testing */
  category: string;
  /** npm package name, or `node` / `npm` */
  name: string;
  label: string;
  version: string;
  /** the range in package.json, absent for the runtime and the remotes */
  range?: string;
  /** a micro-frontend loaded at runtime, not installed */
  remote?: boolean;
  /** where it lives, for a remote: its deployment */
  url?: string;
}

export type ProjectKind = 'app' | 'e2e' | 'lib';

/** A project of the Nx workspace, with its sheriff tags as domain and layer */
export interface ProjectInfo {
  name: string;
  root: string;
  kind: ProjectKind;
  /** `domain:<x>` tag, e.g. cv, showcase, shared */
  domain?: string;
  /** `type:<x>` tag, e.g. feature, data-access, ui, util, api */
  layer?: string;
  /** other workspace projects it imports */
  dependencies: string[];
}

/** A sheriff depRule: modules tagged `from` may import modules tagged `to` */
export interface DependencyRule {
  from: string;
  /** tags, `*`, or `same domain` */
  to: string[];
}

export interface Architecture {
  projects: ProjectInfo[];
  rules: DependencyRule[];
}
