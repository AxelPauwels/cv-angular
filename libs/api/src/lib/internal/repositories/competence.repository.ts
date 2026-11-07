import type { Competence } from '../generated/resolvers-types';

const competences: Competence[] = [
  {
    // title: 'Angular enterprise development',
    title: 't.competence.angular-enterprise.title',
    description: 't.competence.angular-enterprise.description',
  },
  {
    // title: 'Front-end architecture',
    title: 't.competence.front-end-architecture.title',
    description: 't.competence.front-end-architecture.description',
  },
  {
    // title: 'Clean, maintainable code',
    title: 't.competence.clean-code.title',
    description: 't.competence.clean-code.description',
  },
  {
    // title: 'Collaboration',
    title: 't.competence.collaboration.title',
    description: 't.competence.collaboration.description',
  },
  {
    // title: 'Modern & AI-assisted development',
    title: 't.competence.ai-assisted-development.title',
    description: 't.competence.ai-assisted-development.description',
  },
];

export const competenceRepository = {
  findAll: (): Competence[] => competences,
};
