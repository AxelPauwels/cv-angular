import type { Training } from '../generated/resolvers-types';

const trainings: Training[] = [
  {
    uuid: 'd7afe4c2-6948-4d60-aa66-925a08d4f6b6',
    name: 'Modern Angular v22',
    provider: 'Angular Architects GDE Manfred Steyer',
    year: 2026,
    status: 'COMPLETED',
  },
  {
    uuid: '7c12c9a7-940c-4872-9c22-a1259184c232',
    name: 'Angular Large-Scale Enterprise Architecture',
    provider: 'Brecht Billiet',
    year: 2026,
    status: 'COMPLETED',
  },
  {
    uuid: '7eb165d3-1c92-4941-b96c-06aa673de0e5',
    name: 'Craftsmanship II Clean Architecture',
    provider: 'Sopra Steria',
    year: 2025,
    status: 'COMPLETED',
  },
  {
    uuid: 'aa112fb9-5c48-4625-94c8-791c846babd5',
    name: 'Microservices Solution Building',
    provider: 'Sopra Steria',
    year: 2025,
    status: 'COMPLETED',
  },
  {
    uuid: '58434877-8fe8-4c5f-b785-70ba88545ea1',
    name: 'Craftsmanship I Clean Code TDD',
    provider: 'Sopra Steria',
    year: 2024,
    status: 'COMPLETED',
  },
  {
    uuid: '812b8255-1748-41e8-b5c4-58286351cb33',
    name: 'NG-BE',
    status: 'RECURRING',
  },
];

export const trainingRepository = {
  findAll: (): Training[] => trainings,
};
