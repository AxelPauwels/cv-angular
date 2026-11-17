import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GRAPHQL_ENDPOINT } from '@cv/shared-data-access';
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import {
  AssistantEducationDocument,
  AssistantExperiencesDocument,
  AssistantProfileDocument,
  AssistantReferencesDocument,
  AssistantSkillsDocument,
} from './internal/generated/graphql';
import {
  toAssistantEducation,
  toAssistantExperiences,
  toAssistantProfile,
  toAssistantReferences,
  toAssistantSkills,
} from './internal/mappers/cv-knowledge.mapper';
import type {
  AssistantEducation,
  AssistantExperience,
  AssistantProfile,
  AssistantReference,
  AssistantSkills,
} from './types/cv-knowledge.types';

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * Reads the CV from the GraphQL API on demand, for the assistant's tools.
 * Promise-based (not resources): the model asks for data in the middle of a
 * conversation, outside any template.
 */
@Service()
export class CvKnowledgeService {
  private readonly _http = inject(HttpClient);

  profile(): Promise<AssistantProfile> {
    return this._query(AssistantProfileDocument).then(toAssistantProfile);
  }

  experiences(): Promise<AssistantExperience[]> {
    return this._query(AssistantExperiencesDocument).then(
      toAssistantExperiences
    );
  }

  references(): Promise<AssistantReference[]> {
    return this._query(AssistantReferencesDocument).then(toAssistantReferences);
  }

  skills(): Promise<AssistantSkills> {
    return this._query(AssistantSkillsDocument).then(toAssistantSkills);
  }

  education(): Promise<AssistantEducation> {
    return this._query(AssistantEducationDocument).then(toAssistantEducation);
  }

  private async _query<TResult>(
    document: DocumentTypeDecoration<TResult, Record<string, never>>
  ): Promise<TResult> {
    const response = await firstValueFrom(
      this._http.post<GraphqlResponse<TResult>>(GRAPHQL_ENDPOINT, {
        query: document.toString(),
        variables: {},
      })
    );
    if (response.errors?.length || !response.data) {
      throw new Error(
        response.errors?.map((e) => e.message).join('\n') ?? 'No data'
      );
    }
    return response.data;
  }
}
