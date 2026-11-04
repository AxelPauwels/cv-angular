import { Service } from '@angular/core';
import type { HttpResourceRef } from '@angular/common/http';
import { graphqlResource } from '@cv/shared-data-access';
import { ReferencesDocument } from '../generated/graphql';
import { toReference } from '../mappers/reference.mapper';
import type { Reference } from '../../types/reference.types';

@Service()
export class ReferenceService {
  references(): HttpResourceRef<Reference[] | undefined> {
    return graphqlResource(ReferencesDocument, {
      map: ({ references }) => references.map(toReference),
    });
  }
}
