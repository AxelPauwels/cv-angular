import { Service } from '@angular/core';
import type { HttpResourceRef } from '@angular/common/http';
import { graphqlResource } from '@cv/shared-data-access';
import {
  AdditionalLearningsDocument,
  CertificatesDocument,
  EducationsDocument,
} from '../generated/graphql';
import {
  toAdditionalLearning,
  toCertificate,
  toEducation,
} from '../mappers/education.mapper';
import type {
  AdditionalLearning,
  Certificate,
  Education,
} from '../../types/education.types';

/** Call each method in an injection context, e.g. a component field initializer */
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
}
