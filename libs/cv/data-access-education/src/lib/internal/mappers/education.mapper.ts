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
    id: dto.uuid,
    category: dto.category,
    level: dto.level,
    specialization: dto.specialization,
    school: { ...dto.school },
    period: toPeriod(dto.period),
    ...(degree ? { degree } : {}),
  };
}

export function toCertificate({
  uuid,
  name,
  url,
  issuer,
  year,
}: CertificateFieldsFragment): Certificate {
  return { id: uuid, name, issuer, year, ...(url ? { url } : {}) };
}

export function toTraining({
  uuid,
  name,
  provider,
  year,
  status,
}: TrainingFieldsFragment): Training {
  return {
    id: uuid,
    name,
    status,
    ...(provider ? { provider } : {}),
    ...(year ? { year } : {}),
  };
}

export function toAdditionalLearning(
  dto: AdditionalLearningFieldsFragment
): AdditionalLearning {
  return { id: dto.uuid, name: dto.name, url: dto.url };
}
