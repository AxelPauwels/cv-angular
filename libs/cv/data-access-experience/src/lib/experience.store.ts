import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
import { ExperienceService } from './internal/services/experience.service';
import type { Experience } from './types/experience.types';

export const ExperienceStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _experiences: inject(ExperienceService).experiences(),
  })),
  withLinkedState(({ _experiences }) => ({
    experiences: (): Experience[] =>
      _experiences.hasValue() ? _experiences.value() : [],
    isLoading: () => _experiences.isLoading(),
  })),
  withComputed(({ _experiences }) => ({
    error: computed(() => _experiences.error()),
  })),
  withMethods(({ _experiences }) => ({
    reload(): void {
      _experiences.reload();
    },
  })),
  withDevToolsForDebugMode('experience')
);
