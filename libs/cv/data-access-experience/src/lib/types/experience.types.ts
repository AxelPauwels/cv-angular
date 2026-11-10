import type { Period } from '@cv/shared-util-types';

export type ExperienceId = string;

export type ExperienceCategory = 'HORECA' | 'IT';

export interface Work {
  name: string;
  location: string;
  position: string;
}

export interface Experience {
  id: ExperienceId;
  category: ExperienceCategory;
  work: Work;
  period: Period;
  isInternship: boolean;
  jobDescriptions: string[];
  /** Technologies and tools used */
  stack: string[];
}
