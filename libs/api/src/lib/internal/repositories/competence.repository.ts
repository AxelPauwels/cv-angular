import type { Competence } from '../generated/resolvers-types';

const competences: Competence[] = [
  {
    uuid: '7a688f1c-1cf5-433c-9e82-4d9bd73cf9aa',
    // title: 'Angular enterprise development',
    title: 't.competence.angular-enterprise.title',
    description: 't.competence.angular-enterprise.description',
  },
  {
    uuid: '5da917c4-6fca-46f1-a9f4-4f7b154e10d4',
    // title: 'Front-end architecture',
    title: 't.competence.front-end-architecture.title',
    description: 't.competence.front-end-architecture.description',
  },
  {
    uuid: '9e6182c1-9c5b-4005-aaaa-3e7bba155794',
    // title: 'Clean, maintainable code',
    title: 't.competence.clean-code.title',
    description: 't.competence.clean-code.description',
  },
  {
    uuid: '853f6905-bb0f-4ed6-b625-45597b087227',
    // title: 'Collaboration',
    title: 't.competence.collaboration.title',
    description: 't.competence.collaboration.description',
  },
  {
    uuid: '12e1ff50-b3bd-4bcc-9dce-ab795aeec18a',
    // title: 'Modern & AI-assisted development',
    title: 't.competence.ai-assisted-development.title',
    description: 't.competence.ai-assisted-development.description',
  },
];

export const competenceRepository = {
  findAll: (): Competence[] => competences,
};
