import { toPeriod } from '@cv/shared-util-types';
import type { ReferenceFieldsFragment } from '../generated/graphql';
import type { Reference } from '../../types/reference.types';

export function toReference(dto: ReferenceFieldsFragment): Reference {
  return {
    name: dto.name,
    work: dto.work,
    client: dto.client ?? undefined,
    workCategory: dto.workCategory,
    workCategoryPeriod: toPeriod(dto.workCategoryPeriod),
    function: dto.function,
  };
}
