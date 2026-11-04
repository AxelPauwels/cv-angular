import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { ExperienceService } from './internal/services/experience.service';
import type { Experience } from './types/experience.types';

/**
 * Loads once on first use and keeps the result for the whole app, so
 * navigating back to a page shows it without loading again.
 */
export const ExperienceStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _experiences: inject(ExperienceService).experiences(),
  })),
  withComputed(({ _experiences }) => ({
    experiences: computed((): Experience[] =>
      _experiences.hasValue() ? _experiences.value() : []
    ),
    isLoading: computed(() => _experiences.isLoading()),
    error: computed(() => _experiences.error()),
  })),
  withMethods(({ _experiences }) => ({
    reload(): void {
      _experiences.reload();
    },
  }))
);
