import type { ExperienceCategory } from '@cv/cv-data-access-experience';
import type { Period } from '@cv/shared-util-types';

export type ReferenceId = string;

export interface Reference {
  id: ReferenceId;
  name: string;
  /** The employer the reference worked at */
  work: string;
  /** The employer's client where the reference worked with me, e.g. `Ravago` for `Sopra Steria` */
  client?: string;
  workCategory: ExperienceCategory;
  workCategoryPeriod: Period;
  function: string;
}
