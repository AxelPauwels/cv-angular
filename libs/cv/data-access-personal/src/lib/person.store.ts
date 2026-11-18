import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
import { PersonService } from './internal/services/person.service';
import type { Person } from './types/person.types';

export const PersonStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _person: inject(PersonService).person(),
  })),
  withLinkedState(({ _person }) => ({
    person: (): Person | undefined =>
      _person.hasValue() ? _person.value() : undefined,
    isLoading: () => _person.isLoading(),
  })),
  withComputed(({ _person }) => ({
    error: computed(() => _person.error()),
  })),
  withMethods(({ _person }) => ({
    reload(): void {
      _person.reload();
    },
  })),
  withDevToolsForDebugMode('person')
);
