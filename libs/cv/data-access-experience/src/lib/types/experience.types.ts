import type { Period } from '@cv/shared-util-types';

export type ExperienceCategory = 'HORECA' | 'IT';

export interface Work {
  name: string;
  location: string;
  /** translation key */
  position: string;
}

export interface Experience {
  category: ExperienceCategory;
  work: Work;
  period: Period;
  isInternship: boolean;
  /** translation keys, empty when there are none */
  jobDescriptions: string[];
}
