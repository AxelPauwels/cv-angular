import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import type { Person } from '@axel-pauwels/cv-api';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  cvMfeWrapperConfig,
  Wrapper,
  WrapperConfig,
} from '../shared/ui-federation/wrapper';
import { MacWindow } from '@axel-pauwels/mac-window';
import { ExperienceList } from '../experience/experience-list';
import { graphqlResource } from '../shared/data-access/graphql-resource';

const PEOPLE_QUERY = /* GraphQL */ `
  query People {
    people {
      id
      name
    }
  }
`;

const PERSON_QUERY = /* GraphQL */ `
  query Person($id: ID!) {
    person(id: $id) {
      id
      name
      age
    }
  }
`;

@Component({
  selector: 'app-example',
  imports: [MatButton, MatSlideToggle, Wrapper, MacWindow, ExperienceList],
  templateUrl: './example.html',
})
export class Example {
  protected readonly title = 'cv';

  protected readonly cvMfe: WrapperConfig = cvMfeWrapperConfig;

  /** Options for the dropdown: POST /graphql (operation "People") */
  protected readonly people = graphqlResource<{
    people: Pick<Person, 'id' | 'name'>[];
  }>(PEOPLE_QUERY);

  protected readonly selectedPersonId = signal('1');

  /** Re-runs (new POST /graphql, operation "Person") whenever the id changes */
  protected readonly person = graphqlResource<{ person: Person | null }>(
    PERSON_QUERY,
    () => ({ id: this.selectedPersonId() })
  );
}
