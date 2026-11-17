/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Common European Framework of Reference for Languages (CEFR) levels, from beginner to mastery. */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type EducationLevel =
  'CUSTOM_COURSE' | 'HIGH_SCHOOL' | 'SECONDARY_EDUCATION';

export type ExperienceCategory = 'HORECA' | 'IT';

/**
 * ISO 639-1 two-letter language codes.
 * Can include all official languages used worldwide.
 */
export type LanguageIsoCode = 'DE' | 'EN' | 'ES' | 'FR' | 'IT' | 'NL';

/** In order of proficiency */
export type LanguageProficiency =
  'BASIC' | 'EXCELLENT' | 'FAIR' | 'GOOD' | 'VERY_GOOD';

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

export type TrainingStatus =
  | 'COMPLETED'
  | 'ONGOING'
  /** Attended every year, e.g. a conference */
  | 'RECURRING';

export type AssistantProfileQueryVariables = Exact<{ [key: string]: never }>;

export type AssistantProfileQuery = {
  person: {
    firstName: string;
    lastName: string;
    functionTitle: string;
    profile: string;
    contact: {
      website: string | null;
      linkedIn: string | null;
      github: string | null;
      address: { city: string; country: string };
    };
    hobbies: Array<{ name: string; comment: string | null }>;
    languages: Array<{
      isNativeLanguage: boolean;
      spoken: LanguageProficiency;
      written: LanguageProficiency;
      cefrLevel: CefrLevel | null;
      language: { isoCode: LanguageIsoCode };
    }>;
  };
};

export type AssistantExperiencesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AssistantExperiencesQuery = {
  experiences: Array<{
    uuid: string;
    category: ExperienceCategory;
    isInternship: boolean;
    project: string | null;
    jobDescriptions: Array<string> | null;
    stack: Array<string>;
    work: { name: string; location: string; position: string };
    period: { start: string; end: string | null };
  }>;
};

export type AssistantReferencesQueryVariables = Exact<{ [key: string]: never }>;

export type AssistantReferencesQuery = {
  references: Array<{
    uuid: string;
    name: string;
    function: string;
    work: string;
    client: string | null;
    workCategory: ExperienceCategory;
    workCategoryPeriod: { start: string; end: string | null };
  }>;
};

export type AssistantSkillsQueryVariables = Exact<{ [key: string]: never }>;

export type AssistantSkillsQuery = {
  otherSkills: Array<string>;
  skills: Array<{
    category: SkillCategory;
    entries: Array<{ name: string; level: number }>;
  }>;
  competences: Array<{ title: string; description: string }>;
};

export type AssistantEducationQueryVariables = Exact<{ [key: string]: never }>;

export type AssistantEducationQuery = {
  educations: Array<{
    category: ExperienceCategory;
    level: EducationLevel;
    specialization: string;
    degree: string | null;
    school: { name: string; location: string };
    period: { start: string; end: string | null };
  }>;
  certificates: Array<{ name: string; issuer: string; year: number }>;
  trainings: Array<{
    name: string;
    provider: string | null;
    year: number | null;
    status: TrainingStatus;
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

export const AssistantProfileDocument = new TypedDocumentString(`
    query AssistantProfile {
  person {
    firstName
    lastName
    functionTitle
    profile
    contact {
      address {
        city
        country
      }
      website
      linkedIn
      github
    }
    hobbies {
      name
      comment
    }
    languages {
      isNativeLanguage
      language {
        isoCode
      }
      spoken
      written
      cefrLevel
    }
  }
}
    `) as unknown as TypedDocumentString<
  AssistantProfileQuery,
  AssistantProfileQueryVariables
>;
export const AssistantExperiencesDocument = new TypedDocumentString(`
    query AssistantExperiences {
  experiences {
    uuid
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
    project
    jobDescriptions
    stack
  }
}
    `) as unknown as TypedDocumentString<
  AssistantExperiencesQuery,
  AssistantExperiencesQueryVariables
>;
export const AssistantReferencesDocument = new TypedDocumentString(`
    query AssistantReferences {
  references {
    uuid
    name
    function
    work
    client
    workCategory
    workCategoryPeriod {
      start
      end
    }
  }
}
    `) as unknown as TypedDocumentString<
  AssistantReferencesQuery,
  AssistantReferencesQueryVariables
>;
export const AssistantSkillsDocument = new TypedDocumentString(`
    query AssistantSkills {
  skills {
    category
    entries {
      name
      level
    }
  }
  otherSkills
  competences {
    title
    description
  }
}
    `) as unknown as TypedDocumentString<
  AssistantSkillsQuery,
  AssistantSkillsQueryVariables
>;
export const AssistantEducationDocument = new TypedDocumentString(`
    query AssistantEducation {
  educations {
    category
    level
    specialization
    degree
    school {
      name
      location
    }
    period {
      start
      end
    }
  }
  certificates {
    name
    issuer
    year
  }
  trainings {
    name
    provider
    year
    status
  }
}
    `) as unknown as TypedDocumentString<
  AssistantEducationQuery,
  AssistantEducationQueryVariables
>;
