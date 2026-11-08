/** ISO 3166-1 alpha-2 country codes representing nationality */
export type NationalityIsoCode =
  'BE' | 'NL' | 'FR' | 'DE' | 'LU' | 'GB' | 'IT' | 'ES' | 'PT' | 'US' | 'CA';

/** Marital status according to EU official categories */
export type MaritalStatus =
  | 'SINGLE'
  | 'MARRIED'
  | 'DIVORCED'
  | 'WIDOWED'
  | 'SEPARATED'
  | 'REGISTERED_PARTNERSHIP'
  | 'UNKNOWN';

/** Myers–Briggs Type Indicator (MBTI) */
export type PersonalityType =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/** ISO 639-1 two-letter language codes */
export type LanguageIsoCode = 'NL' | 'FR' | 'DE' | 'EN' | 'ES' | 'IT';

/** Language and region (BCP 47) */
export type Locale =
  'NL_BE' | 'NL_NL' | 'FR_BE' | 'FR_FR' | 'DE_BE' | 'EN_GB' | 'EN_US';

/** In order of proficiency */
export type LanguageProficiency =
  'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'BASIC';

/** Where the person lives; only the city, the street isn't shown */
export interface Address {
  city: string;
  /** translation key suffix, e.g. `belgium` for `t.country.belgium` */
  country: string;
}

export interface ContactInfo {
  address: Address;
  email: string;
  linkedIn?: string;
  github?: string;
}

export interface Child {
  name: string;
  gender: Gender;
}

export interface PersonalInfo {
  dateOfBirth: Date;
  nationality: NationalityIsoCode;
  maritalStatus: MaritalStatus;
  children: Child[];
  personalityType: PersonalityType;
}

export interface Hobby {
  name: string;
  comment?: string;
  icon: string;
}

export interface Language {
  isoCode: LanguageIsoCode;
  locale: Locale;
}

export interface LanguageSkill {
  isNativeLanguage: boolean;
  language: Language;
  spoken: LanguageProficiency;
  written: LanguageProficiency;
}

export interface Person {
  firstName: string;
  lastName: string;
  functionTitle: string;
  contact: ContactInfo;
  personal: PersonalInfo;
  hobbies: Hobby[];
  languages: LanguageSkill[];
}
