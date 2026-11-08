import { Service } from '@angular/core';
import type { HttpResourceRef } from '@angular/common/http';
import { graphqlResource } from '@cv/shared-data-access';
import { ExperiencesDocument } from '../generated/graphql';
import { toExperience } from '../mappers/experience.mapper';
import type { Experience } from '../../types/experience.types';

@Service()
export class ExperienceService {
  experiences(): HttpResourceRef<Experience[] | undefined> {
    return graphqlResource(ExperiencesDocument, {
      map: ({ experiences }) => experiences.map(toExperience),
    });
  }
}
