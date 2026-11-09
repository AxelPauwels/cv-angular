import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** ISO 8601 date-time string, e.g. 2020-01-01T00:00:00.000Z (graphql-scalars DateTime) */
  DateTime: { input: Date; output: Date };
};

export type AdditionalLearning = {
  __typename?: 'AdditionalLearning';
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  number: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  street: Scalars['String']['output'];
};

/** Common European Framework of Reference for Languages (CEFR) levels, from beginner to mastery. */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Certificate = {
  __typename?: 'Certificate';
  /** Who issued the certificate, e.g. Linux Professional Institute */
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** Verification link, or a note when there is none online */
  url?: Maybe<Scalars['String']['output']>;
  year: Scalars['Int']['output'];
};

export type Child = {
  __typename?: 'Child';
  gender: Gender;
  name: Scalars['String']['output'];
};

/** Core competence as shown on the CV */
export type Competence = {
  __typename?: 'Competence';
  /** Translation key */
  description: Scalars['String']['output'];
  /** Translation key */
  title: Scalars['String']['output'];
};

export type ContactInfo = {
  __typename?: 'ContactInfo';
  address: Address;
  email: Scalars['String']['output'];
  /** Profile URL */
  github?: Maybe<Scalars['String']['output']>;
  linkedIn?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type Education = {
  __typename?: 'Education';
  /** The career it prepared for: the education page groups by it, like experience */
  category: ExperienceCategory;
  degree?: Maybe<Scalars['String']['output']>;
  level: EducationLevel;
  period: Period;
  school: School;
  specialization: Scalars['String']['output'];
};

export type EducationLevel =
  'CUSTOM_COURSE' | 'HIGH_SCHOOL' | 'SECONDARY_EDUCATION';

export type Experience = {
  __typename?: 'Experience';
  category: ExperienceCategory;
  isInternship: Scalars['Boolean']['output'];
  /** Translation keys */
  jobDescriptions?: Maybe<Array<Scalars['String']['output']>>;
  period: Period;
  /** Project or programme (translation key) */
  project?: Maybe<Scalars['String']['output']>;
  /** Technologies and tools used */
  stack: Array<Scalars['String']['output']>;
  work: Work;
};

export type ExperienceCategory = 'HORECA' | 'IT';

export type Gender = 'FEMALE' | 'MALE' | 'OTHER';

export type Hobby = {
  __typename?: 'Hobby';
  comment?: Maybe<Scalars['String']['output']>;
  icon: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Language = {
  __typename?: 'Language';
  isoCode: LanguageIsoCode;
  locale: Locale;
};

/**
 * ISO 639-1 two-letter language codes.
 * Can include all official languages used worldwide.
 */
export type LanguageIsoCode = 'DE' | 'EN' | 'ES' | 'FR' | 'IT' | 'NL';

/** In order of proficiency */
export type LanguageProficiency =
  'BASIC' | 'EXCELLENT' | 'FAIR' | 'GOOD' | 'VERY_GOOD';

export type LanguageSkill = {
  __typename?: 'LanguageSkill';
  /** CEFR level; null for a native language */
  cefrLevel?: Maybe<CefrLevel>;
  isNativeLanguage: Scalars['Boolean']['output'];
  language: Language;
  spoken: LanguageProficiency;
  written: LanguageProficiency;
};

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

export type Period = {
  __typename?: 'Period';
  end?: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export type Person = {
  __typename?: 'Person';
  contact: ContactInfo;
  firstName: Scalars['String']['output'];
  functionTitle: Scalars['String']['output'];
  hobbies: Array<Hobby>;
  languages: Array<LanguageSkill>;
  lastName: Scalars['String']['output'];
  personal: PersonalInfo;
  /** Profile summary (translation key) */
  profile: Scalars['String']['output'];
};

export type PersonalInfo = {
  __typename?: 'PersonalInfo';
  children: Array<Child>;
  dateOfBirth: Scalars['DateTime']['output'];
  maritalStatus: MaritalStatus;
  nationality: NationalityIsoCode;
  /** First name of the spouse or partner, if any */
  partnerName?: Maybe<Scalars['String']['output']>;
  personalityType: PersonalityType;
};

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

export type Query = {
  __typename?: 'Query';
  additionalLearnings: Array<AdditionalLearning>;
  certificates: Array<Certificate>;
  competences: Array<Competence>;
  educations: Array<Education>;
  experiences: Array<Experience>;
  /**
   * Other technologies, listed without a level.
   * A name, or a translation key (starting with t.) for a translatable label.
   */
  otherSkills: Array<Scalars['String']['output']>;
  person: Person;
  references: Array<Reference>;
  skills: Array<Skill>;
  trainings: Array<Training>;
};

export type Reference = {
  __typename?: 'Reference';
  /**
   * The employer's client where the reference worked with me, e.g. Ravago for
   * Sopra Steria; empty when the reference worked at the employer itself
   */
  client?: Maybe<Scalars['String']['output']>;
  function: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  /** The employer the reference worked at */
  work: Scalars['String']['output'];
  workCategory: ExperienceCategory;
  /** When the reference worked in the given work category */
  workCategoryPeriod: Period;
};

export type School = {
  __typename?: 'School';
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Skill = {
  __typename?: 'Skill';
  category: SkillCategory;
  entries: Array<SkillEntry>;
  icon: Scalars['String']['output'];
};

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

export type SkillEntry = {
  __typename?: 'SkillEntry';
  icon: Scalars['String']['output'];
  /** 0–5 scale */
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

/** A course, training or conference */
export type Training = {
  __typename?: 'Training';
  name: Scalars['String']['output'];
  /** Who organised or taught it */
  provider?: Maybe<Scalars['String']['output']>;
  status: TrainingStatus;
  /** Year it took place; null while ongoing or for a recurring event */
  year?: Maybe<Scalars['Int']['output']>;
};

export type TrainingStatus =
  | 'COMPLETED'
  | 'ONGOING'
  /** Attended every year, e.g. a conference */
  | 'RECURRING';

export type Work = {
  __typename?: 'Work';
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  position: Scalars['String']['output'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<
  TTypes,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<
  T = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AdditionalLearning: ResolverTypeWrapper<AdditionalLearning>;
  Address: ResolverTypeWrapper<Address>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CefrLevel: CefrLevel;
  Certificate: ResolverTypeWrapper<Certificate>;
  Child: ResolverTypeWrapper<Child>;
  Competence: ResolverTypeWrapper<Competence>;
  ContactInfo: ResolverTypeWrapper<ContactInfo>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Education: ResolverTypeWrapper<Education>;
  EducationLevel: EducationLevel;
  Experience: ResolverTypeWrapper<Experience>;
  ExperienceCategory: ExperienceCategory;
  Gender: Gender;
  Hobby: ResolverTypeWrapper<Hobby>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Language: ResolverTypeWrapper<Language>;
  LanguageIsoCode: LanguageIsoCode;
  LanguageProficiency: LanguageProficiency;
  LanguageSkill: ResolverTypeWrapper<LanguageSkill>;
  Locale: Locale;
  MaritalStatus: MaritalStatus;
  NationalityIsoCode: NationalityIsoCode;
  Period: ResolverTypeWrapper<Period>;
  Person: ResolverTypeWrapper<Person>;
  PersonalInfo: ResolverTypeWrapper<PersonalInfo>;
  PersonalityType: PersonalityType;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Reference: ResolverTypeWrapper<Reference>;
  School: ResolverTypeWrapper<School>;
  Skill: ResolverTypeWrapper<Skill>;
  SkillCategory: SkillCategory;
  SkillEntry: ResolverTypeWrapper<SkillEntry>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Training: ResolverTypeWrapper<Training>;
  TrainingStatus: TrainingStatus;
  Work: ResolverTypeWrapper<Work>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AdditionalLearning: AdditionalLearning;
  Address: Address;
  Boolean: Scalars['Boolean']['output'];
  Certificate: Certificate;
  Child: Child;
  Competence: Competence;
  ContactInfo: ContactInfo;
  DateTime: Scalars['DateTime']['output'];
  Education: Education;
  Experience: Experience;
  Hobby: Hobby;
  Int: Scalars['Int']['output'];
  Language: Language;
  LanguageSkill: LanguageSkill;
  Period: Period;
  Person: Person;
  PersonalInfo: PersonalInfo;
  Query: Record<PropertyKey, never>;
  Reference: Reference;
  School: School;
  Skill: Skill;
  SkillEntry: SkillEntry;
  String: Scalars['String']['output'];
  Training: Training;
  Work: Work;
};

export type AdditionalLearningResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['AdditionalLearning'] =
    ResolversParentTypes['AdditionalLearning'],
> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AddressResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Address'] =
    ResolversParentTypes['Address'],
> = {
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  postalCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  street?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CertificateResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Certificate'] =
    ResolversParentTypes['Certificate'],
> = {
  issuer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type ChildResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Child'] =
    ResolversParentTypes['Child'],
> = {
  gender?: Resolver<ResolversTypes['Gender'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CompetenceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Competence'] =
    ResolversParentTypes['Competence'],
> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ContactInfoResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ContactInfo'] =
    ResolversParentTypes['ContactInfo'],
> = {
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  github?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  linkedIn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<
  ResolversTypes['DateTime'],
  any
> {
  name: 'DateTime';
}

export type EducationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Education'] =
    ResolversParentTypes['Education'],
> = {
  category?: Resolver<
    ResolversTypes['ExperienceCategory'],
    ParentType,
    ContextType
  >;
  degree?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  level?: Resolver<ResolversTypes['EducationLevel'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>;
  school?: Resolver<ResolversTypes['School'], ParentType, ContextType>;
  specialization?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ExperienceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Experience'] =
    ResolversParentTypes['Experience'],
> = {
  category?: Resolver<
    ResolversTypes['ExperienceCategory'],
    ParentType,
    ContextType
  >;
  isInternship?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  jobDescriptions?: Resolver<
    Maybe<Array<ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stack?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  work?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
};

export type HobbyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Hobby'] =
    ResolversParentTypes['Hobby'],
> = {
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type LanguageResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Language'] =
    ResolversParentTypes['Language'],
> = {
  isoCode?: Resolver<
    ResolversTypes['LanguageIsoCode'],
    ParentType,
    ContextType
  >;
  locale?: Resolver<ResolversTypes['Locale'], ParentType, ContextType>;
};

export type LanguageSkillResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['LanguageSkill'] =
    ResolversParentTypes['LanguageSkill'],
> = {
  cefrLevel?: Resolver<
    Maybe<ResolversTypes['CefrLevel']>,
    ParentType,
    ContextType
  >;
  isNativeLanguage?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  language?: Resolver<ResolversTypes['Language'], ParentType, ContextType>;
  spoken?: Resolver<
    ResolversTypes['LanguageProficiency'],
    ParentType,
    ContextType
  >;
  written?: Resolver<
    ResolversTypes['LanguageProficiency'],
    ParentType,
    ContextType
  >;
};

export type PeriodResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Period'] =
    ResolversParentTypes['Period'],
> = {
  end?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type PersonResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Person'] =
    ResolversParentTypes['Person'],
> = {
  contact?: Resolver<ResolversTypes['ContactInfo'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  functionTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hobbies?: Resolver<Array<ResolversTypes['Hobby']>, ParentType, ContextType>;
  languages?: Resolver<
    Array<ResolversTypes['LanguageSkill']>,
    ParentType,
    ContextType
  >;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  personal?: Resolver<ResolversTypes['PersonalInfo'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PersonalInfoResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonalInfo'] =
    ResolversParentTypes['PersonalInfo'],
> = {
  children?: Resolver<Array<ResolversTypes['Child']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  maritalStatus?: Resolver<
    ResolversTypes['MaritalStatus'],
    ParentType,
    ContextType
  >;
  nationality?: Resolver<
    ResolversTypes['NationalityIsoCode'],
    ParentType,
    ContextType
  >;
  partnerName?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  personalityType?: Resolver<
    ResolversTypes['PersonalityType'],
    ParentType,
    ContextType
  >;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] =
    ResolversParentTypes['Query'],
> = {
  additionalLearnings?: Resolver<
    Array<ResolversTypes['AdditionalLearning']>,
    ParentType,
    ContextType
  >;
  certificates?: Resolver<
    Array<ResolversTypes['Certificate']>,
    ParentType,
    ContextType
  >;
  competences?: Resolver<
    Array<ResolversTypes['Competence']>,
    ParentType,
    ContextType
  >;
  educations?: Resolver<
    Array<ResolversTypes['Education']>,
    ParentType,
    ContextType
  >;
  experiences?: Resolver<
    Array<ResolversTypes['Experience']>,
    ParentType,
    ContextType
  >;
  otherSkills?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  references?: Resolver<
    Array<ResolversTypes['Reference']>,
    ParentType,
    ContextType
  >;
  skills?: Resolver<Array<ResolversTypes['Skill']>, ParentType, ContextType>;
  trainings?: Resolver<
    Array<ResolversTypes['Training']>,
    ParentType,
    ContextType
  >;
};

export type ReferenceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Reference'] =
    ResolversParentTypes['Reference'],
> = {
  client?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  function?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumber?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  work?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workCategory?: Resolver<
    ResolversTypes['ExperienceCategory'],
    ParentType,
    ContextType
  >;
  workCategoryPeriod?: Resolver<
    ResolversTypes['Period'],
    ParentType,
    ContextType
  >;
};

export type SchoolResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['School'] =
    ResolversParentTypes['School'],
> = {
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type SkillResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Skill'] =
    ResolversParentTypes['Skill'],
> = {
  category?: Resolver<ResolversTypes['SkillCategory'], ParentType, ContextType>;
  entries?: Resolver<
    Array<ResolversTypes['SkillEntry']>,
    ParentType,
    ContextType
  >;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type SkillEntryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SkillEntry'] =
    ResolversParentTypes['SkillEntry'],
> = {
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type TrainingResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Training'] =
    ResolversParentTypes['Training'],
> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TrainingStatus'], ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type WorkResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Work'] =
    ResolversParentTypes['Work'],
> = {
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AdditionalLearning?: AdditionalLearningResolvers<ContextType>;
  Address?: AddressResolvers<ContextType>;
  Certificate?: CertificateResolvers<ContextType>;
  Child?: ChildResolvers<ContextType>;
  Competence?: CompetenceResolvers<ContextType>;
  ContactInfo?: ContactInfoResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Education?: EducationResolvers<ContextType>;
  Experience?: ExperienceResolvers<ContextType>;
  Hobby?: HobbyResolvers<ContextType>;
  Language?: LanguageResolvers<ContextType>;
  LanguageSkill?: LanguageSkillResolvers<ContextType>;
  Period?: PeriodResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonalInfo?: PersonalInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reference?: ReferenceResolvers<ContextType>;
  School?: SchoolResolvers<ContextType>;
  Skill?: SkillResolvers<ContextType>;
  SkillEntry?: SkillEntryResolvers<ContextType>;
  Training?: TrainingResolvers<ContextType>;
  Work?: WorkResolvers<ContextType>;
};
