import { DateTimeResolver } from 'graphql-scalars';
import { additionalLearningRepository } from '../internal/repositories/additional-learning.repository';
import { certificateRepository } from '../internal/repositories/certificate.repository';
import { competenceRepository } from '../internal/repositories/competence.repository';
import { educationRepository } from '../internal/repositories/education.repository';
import { experienceRepository } from '../internal/repositories/experience.repository';
import { personRepository } from '../internal/repositories/person.repository';
import { referenceRepository } from '../internal/repositories/reference.repository';
import { skillRepository } from '../internal/repositories/skill.repository';
import { trainingRepository } from '../internal/repositories/training.repository';
import { resolvers } from './resolvers';

/** The Query resolvers take no parent, arguments or context: call them bare */
const query = resolvers.Query as Record<string, () => unknown>;

describe('resolvers', () => {
  afterEach(() => vi.restoreAllMocks());

  it('serializes DateTime with the graphql-scalars resolver', () => {
    // Arrange
    const expected = DateTimeResolver;

    // Act
    const scalar = resolvers.DateTime;

    // Assert
    expect(scalar).toBe(expected);
  });

  it.each([
    ['person', personRepository, 'get'],
    ['educations', educationRepository, 'findAll'],
    ['experiences', experienceRepository, 'findAll'],
    ['skills', skillRepository, 'findAll'],
    ['otherSkills', skillRepository, 'findOthers'],
    ['references', referenceRepository, 'findAll'],
    ['certificates', certificateRepository, 'findAll'],
    ['additionalLearnings', additionalLearningRepository, 'findAll'],
    ['competences', competenceRepository, 'findAll'],
    ['trainings', trainingRepository, 'findAll'],
  ] as const)('answers %s from its repository', (field, repository, method) => {
    // Arrange
    const answer = Symbol(field);
    const spy = vi
      .spyOn(repository as Record<string, () => unknown>, method)
      .mockReturnValue(answer);

    // Act
    const result = query[field]();

    // Assert
    expect(spy).toHaveBeenCalledOnce();
    expect(result).toBe(answer);
  });

  it('has a resolver for every query field, and no more', () => {
    // Arrange
    const expected = [
      'additionalLearnings',
      'certificates',
      'competences',
      'educations',
      'experiences',
      'otherSkills',
      'person',
      'references',
      'skills',
      'trainings',
    ];

    // Act
    const fields = Object.keys(query).sort();

    // Assert
    expect(fields).toEqual(expected);
  });
});
