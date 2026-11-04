import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { PersonService } from './internal/services/person.service';
import type { Person } from './types/person.types';

/**
 * Loads once on first use and keeps the result for the whole app, so
 * navigating back to a page shows it without loading again.
 */
export const PersonStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _person: inject(PersonService).person(),
  })),
  withComputed(({ _person }) => ({
    person: computed((): Person | undefined =>
      _person.hasValue() ? _person.value() : undefined
    ),
    isLoading: computed(() => _person.isLoading()),
    error: computed(() => _person.error()),
  })),
  withMethods(({ _person }) => ({
    reload(): void {
      _person.reload();
    },
  }))
);
