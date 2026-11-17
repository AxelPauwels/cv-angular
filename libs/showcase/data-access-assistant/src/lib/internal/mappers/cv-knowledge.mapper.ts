import type {
  AssistantEducationQuery,
  AssistantExperiencesQuery,
  AssistantProfileQuery,
  AssistantReferencesQuery,
  AssistantSkillsQuery,
} from '../generated/graphql';
import type {
  AssistantEducation,
  AssistantExperience,
  AssistantPeriod,
  AssistantProfile,
  AssistantReference,
  AssistantSkills,
} from '../../types/cv-knowledge.types';

/**
 * `2020-03-01T00:00:00.000Z` → `2020-03`. Over HTTP a DateTime is an ISO
 * string; the in-browser API hands over the Date itself.
 */
const toMonth = (value: string | Date): string =>
  new Date(value).toISOString().slice(0, 7);

export function toAssistantPeriod(period: {
  start: string | Date;
  end?: string | Date | null;
}): AssistantPeriod {
  return period.end
    ? { start: toMonth(period.start), end: toMonth(period.end) }
    : { start: toMonth(period.start) };
}

/** Drops `null`s so the model sees missing values, not `null` */
const optional = <T>(value: T | null | undefined): T | undefined =>
  value ?? undefined;

export function toAssistantProfile({
  person,
}: AssistantProfileQuery): AssistantProfile {
  return {
    name: `${person.firstName} ${person.lastName}`,
    functionTitle: person.functionTitle,
    profile: person.profile,
    links: {
      website: optional(person.contact.website),
      linkedIn: optional(person.contact.linkedIn),
      github: optional(person.contact.github),
    },
    hobbies: person.hobbies.map(({ name, comment }) => ({
      name,
      comment: optional(comment),
    })),
    languages: person.languages.map((skill) => ({
      isoCode: skill.language.isoCode,
      isNativeLanguage: skill.isNativeLanguage,
      spoken: skill.spoken,
      written: skill.written,
      cefrLevel: optional(skill.cefrLevel),
    })),
  };
}

export function toAssistantExperiences({
  experiences,
}: AssistantExperiencesQuery): AssistantExperience[] {
  return experiences.map((experience) => ({
    id: experience.uuid,
    category: experience.category,
    employer: experience.work.name,
    location: experience.work.location,
    position: experience.work.position,
    period: toAssistantPeriod(experience.period),
    isInternship: experience.isInternship,
    project: optional(experience.project),
    jobDescriptions: experience.jobDescriptions ?? [],
    stack: experience.stack,
  }));
}

export function toAssistantReferences({
  references,
}: AssistantReferencesQuery): AssistantReference[] {
  return references.map((reference) => ({
    id: reference.uuid,
    name: reference.name,
    function: reference.function,
    employer: reference.work,
    client: optional(reference.client),
    category: reference.workCategory,
    period: toAssistantPeriod(reference.workCategoryPeriod),
  }));
}

export function toAssistantSkills(data: AssistantSkillsQuery): AssistantSkills {
  return {
    categories: data.skills.map(({ category, entries }) => ({
      category,
      skills: entries.map(({ name, level }) => ({ name, level })),
    })),
    otherSkills: data.otherSkills,
    competences: data.competences.map(({ title, description }) => ({
      title,
      description,
    })),
  };
}

export function toAssistantEducation(
  data: AssistantEducationQuery
): AssistantEducation {
  return {
    educations: data.educations.map((education) => ({
      category: education.category,
      level: education.level,
      specialization: education.specialization,
      degree: optional(education.degree),
      school: education.school.name,
      location: education.school.location,
      period: toAssistantPeriod(education.period),
    })),
    certificates: data.certificates.map(({ name, issuer, year }) => ({
      name,
      issuer,
      year,
    })),
    trainings: data.trainings.map((training) => ({
      name: training.name,
      provider: optional(training.provider),
      year: optional(training.year),
      status: training.status,
    })),
  };
}
