import { DateTimeResolver } from 'graphql-scalars';
import type { Resolvers } from '../internal/generated/resolvers-types';
import { additionalLearningRepository } from '../internal/repositories/additional-learning.repository';
import { certificateRepository } from '../internal/repositories/certificate.repository';
import { competenceRepository } from '../internal/repositories/competence.repository';
import { educationRepository } from '../internal/repositories/education.repository';
import { experienceRepository } from '../internal/repositories/experience.repository';
import { personRepository } from '../internal/repositories/person.repository';
import { referenceRepository } from '../internal/repositories/reference.repository';
import { skillRepository } from '../internal/repositories/skill.repository';
import { trainingRepository } from '../internal/repositories/training.repository';

/** Typed against type-defs.graphql: a missing or wrongly shaped field fails typecheck */
export const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    person: () => personRepository.get(),
    educations: () => educationRepository.findAll(),
    experiences: () => experienceRepository.findAll(),
    skills: () => skillRepository.findAll(),
    otherSkills: () => skillRepository.findOthers(),
    references: () => referenceRepository.findAll(),
    certificates: () => certificateRepository.findAll(),
    additionalLearnings: () => additionalLearningRepository.findAll(),
    competences: () => competenceRepository.findAll(),
    trainings: () => trainingRepository.findAll(),
  },
};
