import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
import { ReferenceService } from './internal/services/reference.service';
import type { Reference } from './types/reference.types';

export const ReferenceStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _references: inject(ReferenceService).references(),
  })),
  withLinkedState(({ _references }) => ({
    references: (): Reference[] =>
      _references.hasValue() ? _references.value() : [],
    isLoading: () => _references.isLoading(),
  })),
  withComputed(({ _references }) => ({
    error: computed(() => _references.error()),
  })),
  withMethods(({ _references }) => ({
    reload(): void {
      _references.reload();
    },
  })),
  withDevToolsForDebugMode('references')
);
