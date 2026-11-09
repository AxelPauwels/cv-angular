/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type EducationLevel =
  'CUSTOM_COURSE' | 'HIGH_SCHOOL' | 'SECONDARY_EDUCATION';

export type ExperienceCategory = 'HORECA' | 'IT';

export type TrainingStatus =
  | 'COMPLETED'
  | 'ONGOING'
  /** Attended every year, e.g. a conference */
  | 'RECURRING';

export type AdditionalLearningFieldsFragment = { name: string; url: string };

export type CertificateFieldsFragment = {
  name: string;
  url: string | null;
  issuer: string;
  year: number;
};

export type EducationFieldsFragment = {
  category: ExperienceCategory;
  level: EducationLevel;
  degree: string | null;
  specialization: string;
  period: { start: string; end: string | null };
  school: { name: string; location: string };
};

export type TrainingFieldsFragment = {
  name: string;
  provider: string | null;
  year: number | null;
  status: TrainingStatus;
};

export type AdditionalLearningsQueryVariables = Exact<{ [key: string]: never }>;

export type AdditionalLearningsQuery = {
  additionalLearnings: Array<{ name: string; url: string }>;
};

export type CertificatesQueryVariables = Exact<{ [key: string]: never }>;

export type CertificatesQuery = {
  certificates: Array<{
    name: string;
    url: string | null;
    issuer: string;
    year: number;
  }>;
};

export type EducationsQueryVariables = Exact<{ [key: string]: never }>;

export type EducationsQuery = {
  educations: Array<{
    category: ExperienceCategory;
    level: EducationLevel;
    degree: string | null;
    specialization: string;
    period: { start: string; end: string | null };
    school: { name: string; location: string };
  }>;
};

export type TrainingsQueryVariables = Exact<{ [key: string]: never }>;

export type TrainingsQuery = {
  trainings: Array<{
    name: string;
    provider: string | null;
    year: number | null;
    status: TrainingStatus;
  }>;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>['__apiType']
  >;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const AdditionalLearningFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment AdditionalLearningFields on AdditionalLearning {
  name
  url
}
    `,
  { fragmentName: 'AdditionalLearningFields' }
) as unknown as TypedDocumentString<AdditionalLearningFieldsFragment, unknown>;
export const CertificateFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment CertificateFields on Certificate {
  name
  url
  issuer
  year
}
    `,
  { fragmentName: 'CertificateFields' }
) as unknown as TypedDocumentString<CertificateFieldsFragment, unknown>;
export const EducationFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment EducationFields on Education {
  category
  level
  period {
    start
    end
  }
  school {
    name
    location
  }
  degree
  specialization
}
    `,
  { fragmentName: 'EducationFields' }
) as unknown as TypedDocumentString<EducationFieldsFragment, unknown>;
export const TrainingFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment TrainingFields on Training {
  name
  provider
  year
  status
}
    `,
  { fragmentName: 'TrainingFields' }
) as unknown as TypedDocumentString<TrainingFieldsFragment, unknown>;
export const AdditionalLearningsDocument = new TypedDocumentString(`
    query AdditionalLearnings {
  additionalLearnings {
    ...AdditionalLearningFields
  }
}
    fragment AdditionalLearningFields on AdditionalLearning {
  name
  url
}`) as unknown as TypedDocumentString<
  AdditionalLearningsQuery,
  AdditionalLearningsQueryVariables
>;
export const CertificatesDocument = new TypedDocumentString(`
    query Certificates {
  certificates {
    ...CertificateFields
  }
}
    fragment CertificateFields on Certificate {
  name
  url
  issuer
  year
}`) as unknown as TypedDocumentString<
  CertificatesQuery,
  CertificatesQueryVariables
>;
export const EducationsDocument = new TypedDocumentString(`
    query Educations {
  educations {
    ...EducationFields
  }
}
    fragment EducationFields on Education {
  category
  level
  period {
    start
    end
  }
  school {
    name
    location
  }
  degree
  specialization
}`) as unknown as TypedDocumentString<
  EducationsQuery,
  EducationsQueryVariables
>;
export const TrainingsDocument = new TypedDocumentString(`
    query Trainings {
  trainings {
    ...TrainingFields
  }
}
    fragment TrainingFields on Training {
  name
  provider
  year
  status
}`) as unknown as TypedDocumentString<TrainingsQuery, TrainingsQueryVariables>;
