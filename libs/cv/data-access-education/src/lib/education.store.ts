import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { EducationService } from './internal/services/education.service';
import type {
  AdditionalLearning,
  Certificate,
  Education,
} from './types/education.types';

/**
 * Loads once on first use and keeps the result for the whole app, so
 * navigating back to a page shows it without loading again.
 */
export const EducationStore = signalStore(
  { providedIn: 'root' },
  withProps(() => {
    const service = inject(EducationService);
    return {
      _educations: service.educations(),
      _certificates: service.certificates(),
      _additionalLearnings: service.additionalLearnings(),
    };
  }),
  withComputed(({ _educations, _certificates, _additionalLearnings }) => ({
    educations: computed((): Education[] =>
      _educations.hasValue() ? _educations.value() : []
    ),
    certificates: computed((): Certificate[] =>
      _certificates.hasValue() ? _certificates.value() : []
    ),
    additionalLearnings: computed((): AdditionalLearning[] =>
      _additionalLearnings.hasValue() ? _additionalLearnings.value() : []
    ),
    isLoading: computed(
      () =>
        _educations.isLoading() ||
        _certificates.isLoading() ||
        _additionalLearnings.isLoading()
    ),
    error: computed(
      () =>
        _educations.error() ??
        _certificates.error() ??
        _additionalLearnings.error()
    ),
  })),
  withMethods(({ _educations, _certificates, _additionalLearnings }) => ({
    reload: (): void => {
      _educations.reload();
      _certificates.reload();
      _additionalLearnings.reload();
    },
  }))
);
