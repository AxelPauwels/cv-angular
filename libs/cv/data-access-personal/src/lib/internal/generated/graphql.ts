/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Gender = 'FEMALE' | 'MALE' | 'OTHER';

/**
 * ISO 639-1 two-letter language codes.
 * Can include all official languages used worldwide.
 */
export type LanguageIsoCode = 'DE' | 'EN' | 'ES' | 'FR' | 'IT' | 'NL';

/** In order of proficiency */
export type LanguageProficiency =
  'BASIC' | 'EXCELLENT' | 'FAIR' | 'GOOD' | 'VERY_GOOD';

/** Locale codes combining two-letter language codes (iso codes) and region (BCP 47 standard). */
export type Locale =
  'DE_BE' | 'EN_GB' | 'EN_US' | 'FR_BE' | 'FR_FR' | 'NL_BE' | 'NL_NL';

/** Marital status of a person according to EU official categories. */
export type MaritalStatus =
  | 'DIVORCED'
  | 'MARRIED'
  | 'REGISTERED_PARTNERSHIP'
  | 'SEPARATED'
  | 'SINGLE'
  | 'UNKNOWN'
  | 'WIDOWED';

/** ISO 3166-1 alpha-2 country codes representing nationality. */
export type NationalityIsoCode =
  'BE' | 'CA' | 'DE' | 'ES' | 'FR' | 'GB' | 'IT' | 'LU' | 'NL' | 'PT' | 'US';

/**
 * Personality types based on the Myers–Briggs Type Indicator (MBTI).
 * Each type consists of four preferences:
 * - (E) Extraversion / (I) Introversion
 * - (S) Sensing / (N) Intuition
 * - (T) Thinking / (F) Feeling
 * - (J) Judging / (P) Perceiving
 */
export type PersonalityType =
  | 'ENFJ'
  | 'ENFP'
  | 'ENTJ'
  | 'ENTP'
  | 'ESFJ'
  | 'ESFP'
  | 'ESTJ'
  | 'ESTP'
  | 'INFJ'
  | 'INFP'
  | 'INTJ'
  | 'INTP'
  | 'ISFJ'
  | 'ISFP'
  | 'ISTJ'
  | 'ISTP';

export type PersonFieldsFragment = {
  uuid: string;
  firstName: string;
  lastName: string;
  functionTitle: string;
  contact: {
    email: string;
    linkedIn: string | null;
    github: string | null;
    address: { city: string; country: string };
  };
  personal: {
    dateOfBirth: string;
    nationality: NationalityIsoCode;
    maritalStatus: MaritalStatus;
    personalityType: PersonalityType;
    children: Array<{ name: string; gender: Gender }>;
  };
  hobbies: Array<{
    uuid: string;
    name: string;
    comment: string | null;
    icon: string;
  }>;
  languages: Array<{
    uuid: string;
    isNativeLanguage: boolean;
    spoken: LanguageProficiency;
    written: LanguageProficiency;
    language: { isoCode: LanguageIsoCode; locale: Locale };
  }>;
};

export type PersonQueryVariables = Exact<{ [key: string]: never }>;

export type PersonQuery = {
  person: {
    uuid: string;
    firstName: string;
    lastName: string;
    functionTitle: string;
    contact: {
      email: string;
      linkedIn: string | null;
      github: string | null;
      address: { city: string; country: string };
    };
    personal: {
      dateOfBirth: string;
      nationality: NationalityIsoCode;
      maritalStatus: MaritalStatus;
      personalityType: PersonalityType;
      children: Array<{ name: string; gender: Gender }>;
    };
    hobbies: Array<{
      uuid: string;
      name: string;
      comment: string | null;
      icon: string;
    }>;
    languages: Array<{
      uuid: string;
      isNativeLanguage: boolean;
      spoken: LanguageProficiency;
      written: LanguageProficiency;
      language: { isoCode: LanguageIsoCode; locale: Locale };
    }>;
  };
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
export const PersonFieldsFragmentDoc = new TypedDocumentString(
  `
    fragment PersonFields on Person {
  uuid
  firstName
  lastName
  functionTitle
  contact {
    address {
      city
      country
    }
    email
    linkedIn
    github
  }
  personal {
    dateOfBirth
    nationality
    maritalStatus
    children {
      name
      gender
    }
    personalityType
  }
  hobbies {
    uuid
    name
    comment
    icon
  }
  languages {
    uuid
    isNativeLanguage
    language {
      isoCode
      locale
    }
    spoken
    written
  }
}
    `,
  { fragmentName: 'PersonFields' }
) as unknown as TypedDocumentString<PersonFieldsFragment, unknown>;
export const PersonDocument = new TypedDocumentString(`
    query Person {
  person {
    ...PersonFields
  }
}
    fragment PersonFields on Person {
  uuid
  firstName
  lastName
  functionTitle
  contact {
    address {
      city
      country
    }
    email
    linkedIn
    github
  }
  personal {
    dateOfBirth
    nationality
    maritalStatus
    children {
      name
      gender
    }
    personalityType
  }
  hobbies {
    uuid
    name
    comment
    icon
  }
  languages {
    uuid
    isNativeLanguage
    language {
      isoCode
      locale
    }
    spoken
    written
  }
}`) as unknown as TypedDocumentString<PersonQuery, PersonQueryVariables>;
