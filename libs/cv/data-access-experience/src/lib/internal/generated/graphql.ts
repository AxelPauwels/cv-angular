/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ExperienceCategory = 'HORECA' | 'IT';

export type ExperienceFieldsFragment = {
  category: ExperienceCategory;
  isInternship: boolean;
  jobDescriptions: Array<string> | null;
  work: { name: string; location: string; position: string };
  period: { start: string; end: string | null };
};

export type ExperiencesQueryVariables = Exact<{ [key: string]: never }>;

export type ExperiencesQuery = {
  experiences: Array<{
    category: ExperienceCategory;
    isInternship: boolean;
    jobDescriptions: Array<string> | null;
    work: { name: string; location: string; position: string };
    period: { start: string; end: string | null };
  }>;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>['__apiType']
  >;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const ExperienceFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment ExperienceFields on Experience {
  category
  work {
    name
    location
    position
  }
  period {
    start
    end
  }
  isInternship
  jobDescriptions
}
    `,
  { fragmentName: 'ExperienceFields' }
) as unknown as TypedDocumentString<ExperienceFieldsFragment, unknown>;
export const ExperiencesDocument = new TypedDocumentString(`
    query Experiences {
  experiences {
    ...ExperienceFields
  }
}
    fragment ExperienceFields on Experience {
  category
  work {
    name
    location
    position
  }
  period {
    start
    end
  }
  isInternship
  jobDescriptions
}`) as unknown as TypedDocumentString<
  ExperiencesQuery,
  ExperiencesQueryVariables
>;
