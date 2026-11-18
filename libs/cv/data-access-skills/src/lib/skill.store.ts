import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
import { SkillService } from './internal/services/skill.service';
import type { Skill } from './types/skill.types';

export const SkillStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _skills: inject(SkillService).skills(),
  })),
  withLinkedState(({ _skills }) => ({
    skills: (): Skill[] => (_skills.hasValue() ? _skills.value() : []),
    isLoading: () => _skills.isLoading(),
  })),
  withComputed(({ _skills }) => ({
    error: computed(() => _skills.error()),
  })),
  withMethods(({ _skills }) => ({
    reload(): void {
      _skills.reload();
    },
  })),
  withDevToolsForDebugMode('skills')
);
