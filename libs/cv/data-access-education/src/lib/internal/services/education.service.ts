import { Service } from '@angular/core';
import type { HttpResourceRef } from '@angular/common/http';
import { graphqlResource } from '@cv/shared-data-access';
import {
  AdditionalLearningsDocument,
  CertificatesDocument,
  EducationsDocument,
  TrainingsDocument,
} from '../generated/graphql';
import {
  toAdditionalLearning,
  toCertificate,
  toEducation,
  toTraining,
} from '../mappers/education.mapper';
import type {
  AdditionalLearning,
  Certificate,
  Education,
  Training,
} from '../../types/education.types';

@Service()
export class EducationService {
  educations(): HttpResourceRef<Education[] | undefined> {
    return graphqlResource(EducationsDocument, {
      map: ({ educations }) => educations.map(toEducation),
    });
  }

  certificates(): HttpResourceRef<Certificate[] | undefined> {
    return graphqlResource(CertificatesDocument, {
      map: ({ certificates }) => certificates.map(toCertificate),
    });
  }

  additionalLearnings(): HttpResourceRef<AdditionalLearning[] | undefined> {
    return graphqlResource(AdditionalLearningsDocument, {
      map: ({ additionalLearnings }) =>
        additionalLearnings.map(toAdditionalLearning),
    });
  }

  trainings(): HttpResourceRef<Training[] | undefined> {
    return graphqlResource(TrainingsDocument, {
      map: ({ trainings }) => trainings.map(toTraining),
    });
  }
}
