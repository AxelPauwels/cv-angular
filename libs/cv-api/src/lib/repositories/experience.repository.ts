import { Experience } from '../models';

// Mock data: replace with your own CV content.
const experiences: Experience[] = [
  {
    id: 'exp-2',
    company: 'Example Company B',
    role: 'Senior Frontend Developer',
    from: '2022-01',
    description: 'Micro frontends with Nx and Native Federation.',
    skillIds: ['angular', 'typescript', 'nx'],
  },
  {
    id: 'exp-1',
    company: 'Example Company A',
    role: 'Frontend Developer',
    from: '2018-09',
    to: '2021-12',
    description: 'Angular applications backed by GraphQL APIs.',
    skillIds: ['angular', 'rxjs', 'graphql'],
  },
];

export const experienceRepository = {
  findAll: (limit?: number | null): Experience[] =>
    limit ? experiences.slice(0, limit) : experiences,

  findById: (id: string): Experience | undefined =>
    experiences.find((experience) => experience.id === id),
};
