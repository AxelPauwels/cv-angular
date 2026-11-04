import { toPeriod } from '@cv/shared-util-types';
import type {
  AdditionalLearningFieldsFragment,
  CertificateFieldsFragment,
  EducationFieldsFragment,
} from '../generated/graphql';
import type {
  AdditionalLearning,
  Certificate,
  Education,
} from '../../types/education.types';

export function toEducation({
  degree,
  ...dto
}: EducationFieldsFragment): Education {
  return {
    level: dto.level,
    specialization: dto.specialization,
    school: { ...dto.school },
    period: toPeriod(dto.period),
    ...(degree ? { degree } : {}),
  };
}

export function toCertificate(dto: CertificateFieldsFragment): Certificate {
  return { name: dto.name, url: dto.url };
}

export function toAdditionalLearning(
  dto: AdditionalLearningFieldsFragment
): AdditionalLearning {
  return { name: dto.name, url: dto.url };
}
