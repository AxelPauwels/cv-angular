import { Experience, SkillCategory } from '../models';
import { personRepository } from '../repositories/person.repository';
import { experienceRepository } from '../repositories/experience.repository';
import { profileRepository } from '../repositories/profile.repository';
import { skillRepository } from '../repositories/skill.repository';

export const resolvers = {
  Query: {
    people: () => personRepository.findAll(),
    person: (_parent: unknown, args: { id: string }) =>
      personRepository.findById(args.id) ?? null,
    profile: () => profileRepository.get(),
    experiences: (_parent: unknown, args: { limit?: number | null }) =>
      experienceRepository.findAll(args.limit),
    experience: (_parent: unknown, args: { id: string }) =>
      experienceRepository.findById(args.id) ?? null,
    skills: (_parent: unknown, args: { category?: SkillCategory | null }) =>
      skillRepository.findAll(args.category),
  },
  Experience: {
    // Field resolver: an experience only stores skill ids
    skills: (experience: Experience) =>
      skillRepository.findByIds(experience.skillIds),
  },
};
