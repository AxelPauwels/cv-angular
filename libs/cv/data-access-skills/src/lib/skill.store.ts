import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { SkillService } from './internal/services/skill.service';
import type { Skill } from './types/skill.types';

/**
 * Loads once on first use and keeps the result for the whole app, so
 * navigating back to a page shows it without loading again.
 */
export const SkillStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _skills: inject(SkillService).skills(),
  })),
  withComputed(({ _skills }) => ({
    skills: computed((): Skill[] =>
      _skills.hasValue() ? _skills.value() : []
    ),
    isLoading: computed(() => _skills.isLoading()),
    error: computed(() => _skills.error()),
  })),
  withMethods(({ _skills }) => ({
    reload(): void {
      _skills.reload();
    },
  }))
);
