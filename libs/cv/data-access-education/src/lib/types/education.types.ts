import type { Period } from '@cv/shared-util-types';

export type EducationLevel =
  'SECONDARY_EDUCATION' | 'HIGH_SCHOOL' | 'CUSTOM_COURSE';

/** The career an education prepared for, the same split as experience */
export type EducationCategory = 'IT' | 'HORECA';

export interface School {
  name: string;
  location: string;
}

export interface Education {
  category: EducationCategory;
  level: EducationLevel;
  specialization: string;
  school: School;
  period: Period;
  degree?: string;
}

export interface Certificate {
  name: string;
  /** Who issued it, e.g. Linux Professional Institute */
  issuer: string;
  year: number;
  url?: string;
}

export type TrainingStatus = 'COMPLETED' | 'ONGOING' | 'RECURRING';

/** A course, training or conference */
export interface Training {
  name: string;
  /** Who organised or taught it */
  provider?: string;
  /** Absent while ongoing or for a recurring event */
  year?: number;
  status: TrainingStatus;
}

export interface AdditionalLearning {
  name: string;
  url: string;
}
