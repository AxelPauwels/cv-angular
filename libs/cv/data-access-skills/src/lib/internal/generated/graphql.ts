/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Sections of the skills page, in the order they are shown */
export type SkillCategory =
  /** Additional technologies outside the core stack, e.g. back-end and CMS */
  | 'ADDITIONAL_TECHNOLOGIES'
  /** AI & agentic development */
  | 'AI'
  /** Core frontend stack: languages, framework and libraries used every day */
  | 'CORE_STACK'
  /** Development tools: version control, IDEs and collaboration */
  | 'DEVELOPMENT_TOOLS'
  /** Engineering practices: architecture, patterns and ways of working */
  | 'ENGINEERING_PRACTICES'
  /** Testing, accessibility and code quality */
  | 'TESTING_AND_QUALITY';

export type SkillFieldsFragment = {
  category: SkillCategory;
  icon: string;
  entries: Array<{ name: string; level: number; icon: string }>;
};

export type SkillsQueryVariables = Exact<{ [key: string]: never }>;

export type SkillsQuery = {
  skills: Array<{
    category: SkillCategory;
    icon: string;
    entries: Array<{ name: string; level: number; icon: string }>;
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
export const SkillFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment SkillFields on Skill {
  category
  icon
  entries {
    name
    level
    icon
  }
}
    `,
  { fragmentName: 'SkillFields' }
) as unknown as TypedDocumentString<SkillFieldsFragment, unknown>;
export const SkillsDocument = new TypedDocumentString(`
    query Skills {
  skills {
    ...SkillFields
  }
}
    fragment SkillFields on Skill {
  category
  icon
  entries {
    name
    level
    icon
  }
}`) as unknown as TypedDocumentString<SkillsQuery, SkillsQueryVariables>;
