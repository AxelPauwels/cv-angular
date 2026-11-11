import type { SkillFieldsFragment } from '../generated/graphql';
import type { Skill } from '../../types/skill.types';

export function toSkill(dto: SkillFieldsFragment): Skill {
  return {
    id: dto.uuid,
    category: dto.category,
    icon: dto.icon,
    entries: dto.entries.map(({ uuid, ...entry }) => ({ id: uuid, ...entry })),
  };
}
