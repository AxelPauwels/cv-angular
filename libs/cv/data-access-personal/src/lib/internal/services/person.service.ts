import { Service } from '@angular/core';
import type { HttpResourceRef } from '@angular/common/http';
import { graphqlResource } from '@cv/shared-data-access';
import { PersonDocument } from '../generated/graphql';
import { toPerson } from '../mappers/person.mapper';
import type { Person } from '../../types/person.types';

@Service()
export class PersonService {
  person(): HttpResourceRef<Person | undefined> {
    return graphqlResource(PersonDocument, {
      map: ({ person }) => toPerson(person),
    });
  }
}
