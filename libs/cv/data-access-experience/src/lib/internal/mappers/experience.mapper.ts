import { toPeriod } from '@cv/shared-util-types';
import type { ExperienceFieldsFragment } from '../generated/graphql';
import type { Experience } from '../../types/experience.types';

export function toExperience(dto: ExperienceFieldsFragment): Experience {
  return {
    id: dto.uuid,
    category: dto.category,
    work: { ...dto.work },
    period: toPeriod(dto.period),
    isInternship: dto.isInternship,
    jobDescriptions: dto.jobDescriptions ?? [],
    stack: [...dto.stack],
  };
}
