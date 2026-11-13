import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { BuildInfoService } from './internal/services/build-info.service';
import type {
  DependencyRule,
  PackageVersion,
  ProjectInfo,
} from './types/build-info.types';

/**
 * Installed versions of the main frameworks and tools, plus the deployed
 * version of each micro-frontend remote (read at runtime, added once in);
 * loads once
 */
export const VersionStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _versions: inject(BuildInfoService).versions(),
    _remotes: inject(BuildInfoService).remoteVersions(),
  })),
  withComputed(({ _versions, _remotes }) => ({
    packages: computed((): PackageVersion[] =>
      _versions.hasValue()
        ? [
            ..._versions.value(),
            ...(_remotes.hasValue() ? _remotes.value() : []),
          ]
        : []
    ),
    isLoading: computed(() => _versions.isLoading()),
    error: computed(() => _versions.error()),
  })),
  withMethods(({ _versions, _remotes }) => ({
    reload(): void {
      _versions.reload();
      _remotes.reload();
    },
  }))
);

/** Workspace projects and the sheriff dependency rules; loads once */
export const ArchitectureStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _architecture: inject(BuildInfoService).architecture(),
  })),
  withComputed(({ _architecture }) => ({
    projects: computed((): ProjectInfo[] =>
      _architecture.hasValue() ? _architecture.value().projects : []
    ),
    rules: computed((): DependencyRule[] =>
      _architecture.hasValue() ? _architecture.value().rules : []
    ),
    isLoading: computed(() => _architecture.isLoading()),
    error: computed(() => _architecture.error()),
  })),
  withMethods(({ _architecture }) => ({
    reload(): void {
      _architecture.reload();
    },
  }))
);
