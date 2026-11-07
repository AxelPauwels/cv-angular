import type { Training } from '../generated/resolvers-types';

const trainings: Training[] = [
  {
    name: 'Modern Angular v22',
    provider: 'Angular Architects GDE Manfred Steyer',
    year: 2026,
    status: 'COMPLETED',
  },
  {
    name: 'Angular Large-Scale Enterprise Architecture',
    provider: 'Brecht Billiet',
    year: 2026,
    status: 'COMPLETED',
  },
  {
    name: 'Craftsmanship II Clean Architecture',
    provider: 'Sopra Steria',
    year: 2025,
    status: 'COMPLETED',
  },
  {
    name: 'Microservices Solution Building',
    provider: 'Sopra Steria',
    year: 2025,
    status: 'COMPLETED',
  },
  {
    name: 'Craftsmanship I Clean Code TDD',
    provider: 'Sopra Steria',
    year: 2024,
    status: 'COMPLETED',
  },
  {
    name: 'NG-BE',
    status: 'RECURRING',
  },
];

export const trainingRepository = {
  findAll: (): Training[] => trainings,
};
