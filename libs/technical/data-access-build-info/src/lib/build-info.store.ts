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

/** Installed versions of the main frameworks and tools; loads once */
export const VersionStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _versions: inject(BuildInfoService).versions(),
  })),
  withComputed(({ _versions }) => ({
    packages: computed((): PackageVersion[] =>
      _versions.hasValue() ? _versions.value() : []
    ),
    isLoading: computed(() => _versions.isLoading()),
    error: computed(() => _versions.error()),
  })),
  withMethods(({ _versions }) => ({
    reload(): void {
      _versions.reload();
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
