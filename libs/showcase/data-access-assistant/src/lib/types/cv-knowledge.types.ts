/**
 * What the assistant knows about the CV, shaped for a language model: plain
 * JSON, dates as `YYYY-MM` and translation keys (`t.…`) still untranslated.
 * The feature translates the keys before handing the data to the model.
 */

/** `YYYY-MM`; `end` is missing while ongoing */
export interface AssistantPeriod {
  start: string;
  end?: string;
}

export type WorkCategory = 'IT' | 'HORECA';

export interface AssistantProfile {
  name: string;
  functionTitle: string;
  profile: string;
  /** Where Axel lives: the city and a country key (`t.country.…`), no street */
  location: { city: string; country: string };
  links: { website?: string; linkedIn?: string; github?: string };
  hobbies: { name: string; comment?: string }[];
  languages: {
    isoCode: string;
    isNativeLanguage: boolean;
    spoken: string;
    written: string;
    cefrLevel?: string;
  }[];
}

export interface AssistantExperience {
  id: string;
  category: WorkCategory;
  employer: string;
  location: string;
  position: string;
  period: AssistantPeriod;
  isInternship: boolean;
  project?: string;
  jobDescriptions: string[];
  stack: string[];
}

export interface AssistantReference {
  id: string;
  name: string;
  /** Their role (translation key) */
  function: string;
  /** The employer the reference worked at */
  employer: string;
  /** The employer's client where we worked together, if any */
  client?: string;
  category: WorkCategory;
  /** When we worked together */
  period: AssistantPeriod;
}

export interface AssistantSkills {
  categories: { category: string; skills: { name: string; level: number }[] }[];
  otherSkills: string[];
  competences: { title: string; description: string }[];
}

export interface AssistantEducation {
  educations: {
    category: WorkCategory;
    level: string;
    specialization: string;
    degree?: string;
    school: string;
    location: string;
    period: AssistantPeriod;
  }[];
  certificates: { name: string; issuer: string; year: number }[];
  trainings: {
    name: string;
    provider?: string;
    year?: number;
    status: string;
  }[];
}
