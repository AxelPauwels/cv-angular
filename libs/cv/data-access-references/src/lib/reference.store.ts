import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { ReferenceService } from './internal/services/reference.service';
import type { Reference } from './types/reference.types';

export const ReferenceStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _references: inject(ReferenceService).references(),
  })),
  withComputed(({ _references }) => ({
    references: computed((): Reference[] =>
      _references.hasValue() ? _references.value() : []
    ),
    isLoading: computed(() => _references.isLoading()),
    error: computed(() => _references.error()),
  })),
  withMethods(({ _references }) => ({
    reload(): void {
      _references.reload();
    },
  }))
);
