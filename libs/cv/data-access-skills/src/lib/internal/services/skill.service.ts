import { Service } from '@angular/core';
import type { HttpResourceRef } from '@angular/common/http';
import { graphqlResource } from '@cv/shared-data-access';
import { SkillsDocument } from '../generated/graphql';
import { toSkill } from '../mappers/skill.mapper';
import type { Skill } from '../../types/skill.types';

@Service()
export class SkillService {
  skills(): HttpResourceRef<Skill[] | undefined> {
    return graphqlResource(SkillsDocument, {
      map: ({ skills }) => skills.map(toSkill),
    });
  }
}
