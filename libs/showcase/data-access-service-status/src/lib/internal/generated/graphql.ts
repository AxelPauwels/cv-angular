/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ServiceStatusLinksQueryVariables = Exact<{ [key: string]: never }>;

export type ServiceStatusLinksQuery = {
  person: {
    contact: {
      website: string | null;
      linkedIn: string | null;
      github: string | null;
    };
  };
  additionalLearnings: Array<{ uuid: string; name: string; url: string }>;
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

export const ServiceStatusLinksDocument = new TypedDocumentString(`
    query ServiceStatusLinks {
  person {
    contact {
      website
      linkedIn
      github
    }
  }
  additionalLearnings {
    uuid
    name
    url
  }
}
    `) as unknown as TypedDocumentString<
  ServiceStatusLinksQuery,
  ServiceStatusLinksQueryVariables
>;
