import { Component } from '@angular/core';
import type { Experience, Profile, Skill } from '@cv/cv-api';
import { graphqlResource } from '@cv/shared-data-access';

type ExperienceView = Omit<Experience, 'skillIds'> & {
  skills: Pick<Skill, 'id' | 'name'>[];
};

interface CvQueryResult {
  profile: Pick<Profile, 'name' | 'headline'>;
  experiences: ExperienceView[];
}

const CV_QUERY = /* GraphQL */ `
  query Cv {
    profile {
      name
      headline
    }
    experiences {
      id
      company
      role
      from
      to
      description
      skills {
        id
        name
      }
    }
  }
`;

@Component({
  selector: 'lib-experience-list',
  templateUrl: './experience-list.html',
})
export class ExperienceList {
  protected readonly cv = graphqlResource<CvQueryResult>(CV_QUERY);
}
