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

  type Certificate {
    name: String!
    url: String!
  }

  type Child {
    gender: Gender!
    name: String!
  }

  type ContactInfo {
    address: Address!
    email: String!
    linkedIn: String
    phone: String!
    website: String
  }

  """
  ISO 8601 date-time string, e.g. 2020-01-01T00:00:00.000Z (graphql-scalars DateTime)
  """
  scalar DateTime

  """
  Belgian driving license categories
  Based on the official classification by the Belgian Federal Public Service Mobility and Transport.
  """
  enum DriverLicenseCategory {
    A
    A1
    A2
    AM
    B
    BE
    C
    C1
    C1E
    CE
    D
    D1
    D1E
    DE
    G
  }

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
    jobDescriptions: [String!]
    period: Period!
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
  }

  type PersonalInfo {
    children: [Child!]!
    dateOfBirth: DateTime!
    driverLicense: DriverLicenseCategory!
    maritalStatus: MaritalStatus!
    nationality: NationalityIsoCode!
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
    educations: [Education!]!
    experiences: [Experience!]!
    person: Person!
    references: [Reference!]!
    skills: [Skill!]!
  }

  type Reference {
    function: String!
    name: String!
    phoneNumber: String!
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

  enum SkillCategory {
    FRAMEWORKS
    LIBRARIES
    OPERATING_SYSTEMS
    PROGRAMMING_LANGUAGES
    VERSION_CONTROL
  }

  type SkillEntry {
    icon: String!

    """
    0–10 scale
    """
    level: Int!
    name: String!
  }

  type Work {
    location: String!
    name: String!
    position: String!
  }
`;
