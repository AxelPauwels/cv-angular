import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
import { EducationService } from './internal/services/education.service';
import type {
  AdditionalLearning,
  Certificate,
  Education,
  Training,
} from './types/education.types';

export const EducationStore = signalStore(
  { providedIn: 'root' },
  withProps(() => {
    const service = inject(EducationService);
    return {
      _educations: service.educations(),
      _certificates: service.certificates(),
      _additionalLearnings: service.additionalLearnings(),
      _trainings: service.trainings(),
    };
  }),
  withLinkedState(
    ({ _educations, _certificates, _additionalLearnings, _trainings }) => ({
      educations: (): Education[] =>
        _educations.hasValue() ? _educations.value() : [],
      certificates: (): Certificate[] =>
        _certificates.hasValue() ? _certificates.value() : [],
      additionalLearnings: (): AdditionalLearning[] =>
        _additionalLearnings.hasValue() ? _additionalLearnings.value() : [],
      trainings: (): Training[] =>
        _trainings.hasValue() ? _trainings.value() : [],
      isLoading: () =>
        _educations.isLoading() ||
        _certificates.isLoading() ||
        _additionalLearnings.isLoading() ||
        _trainings.isLoading(),
    })
  ),
  withComputed(
    ({ _educations, _certificates, _additionalLearnings, _trainings }) => ({
      error: computed(
        () =>
          _educations.error() ??
          _certificates.error() ??
          _additionalLearnings.error() ??
          _trainings.error()
      ),
    })
  ),
  withMethods(
    ({ _educations, _certificates, _additionalLearnings, _trainings }) => ({
      reload: (): void => {
        _educations.reload();
        _certificates.reload();
        _additionalLearnings.reload();
        _trainings.reload();
      },
    })
  ),
  withDevToolsForDebugMode('education')
);
