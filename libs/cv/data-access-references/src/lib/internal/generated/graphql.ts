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

export type ReferenceFieldsFragment = {
  name: string;
  work: string;
  client: string | null;
  workCategory: ExperienceCategory;
  function: string;
  workCategoryPeriod: { start: string; end: string | null };
};

export type ReferencesQueryVariables = Exact<{ [key: string]: never }>;

export type ReferencesQuery = {
  references: Array<{
    name: string;
    work: string;
    client: string | null;
    workCategory: ExperienceCategory;
    function: string;
    workCategoryPeriod: { start: string; end: string | null };
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
export const ReferenceFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment ReferenceFields on Reference {
  name
  work
  client
  workCategory
  workCategoryPeriod {
    start
    end
  }
  function
}
    `,
  { fragmentName: 'ReferenceFields' }
) as unknown as TypedDocumentString<ReferenceFieldsFragment, unknown>;
export const ReferencesDocument = new TypedDocumentString(`
    query References {
  references {
    ...ReferenceFields
  }
}
    fragment ReferenceFields on Reference {
  name
  work
  client
  workCategory
  workCategoryPeriod {
    start
    end
  }
  function
}`) as unknown as TypedDocumentString<
  ReferencesQuery,
  ReferencesQueryVariables
>;
