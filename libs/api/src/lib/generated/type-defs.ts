/** The schema of type-defs.graphql, for makeExecutableSchema */
export const typeDefs = /* GraphQL */ `
  type AdditionalLearning {
    name: String!
    url: String!
  }

  type Address {
    city: String!
    country: String!
    number: String!
    postalCode: String!
    street: String!
  }

  """
  Common European Framework of Reference for Languages (CEFR) levels, from beginner to mastery.
  """
  enum CefrLevel {
    A1
    A2
    B1
    B2
    C1
    C2
  }

  type Certificate {
    """
    Who issued the certificate, e.g. Linux Professional Institute
    """
    issuer: String!
    name: String!

    """
    Verification link, or a note when there is none online
    """
    url: String
    year: Int!
  }

  type Child {
    gender: Gender!
    name: String!
  }

  """
  Core competence as shown on the CV
  """
  type Competence {
    """
    Translation key
    """
    description: String!

    """
    Translation key
    """
    title: String!
  }

  type ContactInfo {
    address: Address!
    email: String!

    """
    Profile URL
    """
    github: String
    linkedIn: String
    phone: String!
    website: String
  }

  """
  ISO 8601 date-time string, e.g. 2020-01-01T00:00:00.000Z (graphql-scalars DateTime)
  """
  scalar DateTime

  type Education {
    degree: String
    level: EducationLevel!
    period: Period!
    school: School!
    specialization: String!
  }

  enum EducationLevel {
    CUSTOM_COURSE
    HIGH_SCHOOL
    SECONDARY_EDUCATION
  }

  type Experience {
    category: ExperienceCategory!
    isInternship: Boolean!

    """
    Translation keys
    """
    jobDescriptions: [String!]
    period: Period!

    """
    Project or programme (translation key)
    """
    project: String

    """
    Technologies and tools used
    """
    stack: [String!]!
    work: Work!
  }

  enum ExperienceCategory {
    HORECA
    IT
  }

  enum Gender {
    FEMALE
    MALE
    OTHER
  }

  type Hobby {
    comment: String
    icon: String!
    name: String!
  }

  type Language {
    isoCode: LanguageIsoCode!
    locale: Locale!
  }

  """
  ISO 639-1 two-letter language codes.
  Can include all official languages used worldwide.
  """
  enum LanguageIsoCode {
    DE
    EN
    ES
    FR
    IT
    NL
  }

  """
  In order of proficiency
  """
  enum LanguageProficiency {
    BASIC
    EXCELLENT
    FAIR
    GOOD
    VERY_GOOD
  }

  type LanguageSkill {
    """
    CEFR level; null for a native language
    """
    cefrLevel: CefrLevel
    isNativeLanguage: Boolean!
    language: Language!
    spoken: LanguageProficiency!
    written: LanguageProficiency!
  }

  """
  Locale codes combining two-letter language codes (iso codes) and region (BCP 47 standard).
  """
  enum Locale {
    DE_BE
    EN_GB
    EN_US
    FR_BE
    FR_FR
    NL_BE
    NL_NL
  }

  """
  Marital status of a person according to EU official categories.
  """
  enum MaritalStatus {
    DIVORCED
    MARRIED
    REGISTERED_PARTNERSHIP
    SEPARATED
    SINGLE
    UNKNOWN
    WIDOWED
  }

  """
  ISO 3166-1 alpha-2 country codes representing nationality.
  """
  enum NationalityIsoCode {
    BE
    CA
    DE
    ES
    FR
    GB
    IT
    LU
    NL
    PT
    US
  }

  type Period {
    end: DateTime
    start: DateTime!
  }

  type Person {
    contact: ContactInfo!
    firstName: String!
    functionTitle: String!
    hobbies: [Hobby!]!
    languages: [LanguageSkill!]!
    lastName: String!
    personal: PersonalInfo!

    """
    Profile summary (translation key)
    """
    profile: String!
  }

  type PersonalInfo {
    children: [Child!]!
    dateOfBirth: DateTime!
    maritalStatus: MaritalStatus!
    nationality: NationalityIsoCode!

    """
    First name of the spouse or partner, if any
    """
    partnerName: String
    personalityType: PersonalityType!
  }

  """
  Personality types based on the Myers–Briggs Type Indicator (MBTI).
  Each type consists of four preferences:
  - (E) Extraversion / (I) Introversion
  - (S) Sensing / (N) Intuition
  - (T) Thinking / (F) Feeling
  - (J) Judging / (P) Perceiving
  """
  enum PersonalityType {
    ENFJ
    ENFP
    ENTJ
    ENTP
    ESFJ
    ESFP
    ESTJ
    ESTP
    INFJ
    INFP
    INTJ
    INTP
    ISFJ
    ISFP
    ISTJ
    ISTP
  }

  type Query {
    additionalLearnings: [AdditionalLearning!]!
    certificates: [Certificate!]!
    competences: [Competence!]!
    educations: [Education!]!
    experiences: [Experience!]!

    """
    Other technologies, listed without a level.
    A name, or a translation key (starting with t.) for a translatable label.
    """
    otherSkills: [String!]!
    person: Person!
    references: [Reference!]!
    skills: [Skill!]!
    trainings: [Training!]!
  }

  type Reference {
    """
    The employer's client where the reference worked with me, e.g. Ravago for
    Sopra Steria; empty when the reference worked at the employer itself
    """
    client: String
    function: String!
    name: String!
    phoneNumber: String

    """
    The employer the reference worked at
    """
    work: String!
    workCategory: ExperienceCategory!

    """
    When the reference worked in the given work category
    """
    workCategoryPeriod: Period!
  }

  type School {
    location: String!
    name: String!
  }

  type Skill {
    category: SkillCategory!
    entries: [SkillEntry!]!
    icon: String!
  }

  """
  Sections of the skills page, in the order they are shown
  """
  enum SkillCategory {
    """
    Additional technologies outside the core stack, e.g. back-end and CMS
    """
    ADDITIONAL_TECHNOLOGIES

    """
    AI & agentic development
    """
    AI

    """
    Core frontend stack: languages, framework and libraries used every day
    """
    CORE_STACK

    """
    Development tools: version control, IDEs and collaboration
    """
    DEVELOPMENT_TOOLS

    """
    Engineering practices: architecture, patterns and ways of working
    """
    ENGINEERING_PRACTICES

    """
    Testing, accessibility and code quality
    """
    TESTING_AND_QUALITY
  }

  type SkillEntry {
    icon: String!

    """
    0–5 scale
    """
    level: Int!
    name: String!
  }

  """
  A course, training or conference
  """
  type Training {
    name: String!

    """
    Who organised or taught it
    """
    provider: String
    status: TrainingStatus!

    """
    Year it took place; null while ongoing or for a recurring event
    """
    year: Int
  }

  enum TrainingStatus {
    COMPLETED
    ONGOING

    """
    Attended every year, e.g. a conference
    """
    RECURRING
  }

  type Work {
    location: String!
    name: String!
    position: String!
  }
`;
