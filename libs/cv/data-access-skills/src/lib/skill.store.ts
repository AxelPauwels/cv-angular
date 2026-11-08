import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { SkillService } from './internal/services/skill.service';
import type { Skill } from './types/skill.types';

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
