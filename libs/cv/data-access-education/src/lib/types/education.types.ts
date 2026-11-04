import type { Period } from '@cv/shared-util-types';

export type EducationLevel =
  'SECONDARY_EDUCATION' | 'HIGH_SCHOOL' | 'CUSTOM_COURSE';

export interface School {
  name: string;
  location: string;
}

export interface Education {
  level: EducationLevel;
  specialization: string;
  school: School;
  period: Period;
  degree?: string;
}

export interface Certificate {
  name: string;
  url: string;
}

export interface AdditionalLearning {
  name: string;
  url: string;
}
