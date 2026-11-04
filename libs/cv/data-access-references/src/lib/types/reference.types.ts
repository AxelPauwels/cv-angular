import type { ExperienceCategory } from '@cv/cv-data-access-experience';
import type { Period } from '@cv/shared-util-types';

export interface Reference {
  name: string;
  work: string;
  workCategory: ExperienceCategory;
  /** when the reference worked in the given work category */
  workCategoryPeriod: Period;
  function: string;
  phoneNumber: string;
}
