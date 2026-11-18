import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
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
  withLinkedState(({ _versions, _remotes }) => ({
    packages: (): PackageVersion[] =>
      _versions.hasValue()
        ? [
            ..._versions.value(),
            ...(_remotes.hasValue() ? _remotes.value() : []),
          ]
        : [],
    isLoading: () => _versions.isLoading(),
  })),
  withComputed(({ _versions }) => ({
    error: computed(() => _versions.error()),
  })),
  withMethods(({ _versions, _remotes }) => ({
    reload(): void {
      _versions.reload();
      _remotes.reload();
    },
  })),
  withDevToolsForDebugMode('versions')
);

/** Workspace projects and the sheriff dependency rules; loads once */
export const ArchitectureStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _architecture: inject(BuildInfoService).architecture(),
  })),
  withLinkedState(({ _architecture }) => ({
    projects: (): ProjectInfo[] =>
      _architecture.hasValue() ? _architecture.value().projects : [],
    rules: (): DependencyRule[] =>
      _architecture.hasValue() ? _architecture.value().rules : [],
    isLoading: () => _architecture.isLoading(),
  })),
  withComputed(({ _architecture }) => ({
    error: computed(() => _architecture.error()),
  })),
  withMethods(({ _architecture }) => ({
    reload(): void {
      _architecture.reload();
    },
  })),
  withDevToolsForDebugMode('architecture')
);
