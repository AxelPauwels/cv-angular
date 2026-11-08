import { toPeriod } from '@cv/shared-util-types';
import type {
  AdditionalLearningFieldsFragment,
  CertificateFieldsFragment,
  EducationFieldsFragment,
  TrainingFieldsFragment,
} from '../generated/graphql';
import type {
  AdditionalLearning,
  Certificate,
  Education,
  Training,
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

export function toCertificate({
  name,
  url,
  issuer,
  year,
}: CertificateFieldsFragment): Certificate {
  return { name, issuer, year, ...(url ? { url } : {}) };
}

export function toTraining({
  name,
  provider,
  year,
  status,
}: TrainingFieldsFragment): Training {
  return {
    name,
    status,
    ...(provider ? { provider } : {}),
    ...(year ? { year } : {}),
  };
}

export function toAdditionalLearning(
  dto: AdditionalLearningFieldsFragment
): AdditionalLearning {
  return { name: dto.name, url: dto.url };
}
