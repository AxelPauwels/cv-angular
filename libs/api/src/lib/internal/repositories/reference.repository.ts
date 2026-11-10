import type { Reference } from '../generated/resolvers-types';
import { fromYear } from '../utils/date';

const horecaReferences: Reference[] = [
  {
    uuid: 'f116c10b-36b0-4445-8ca7-c2ef31c41485',
    function: 'Chef',
    name: 'Bart Van De Perre',
    phoneNumber: '0476 / 90 76 21',
    work: 'Den Cardijn',
    workCategory: 'HORECA',
    workCategoryPeriod: {
      start: fromYear('2014'),
      end: fromYear('2015'),
    },
  },
  {
    uuid: '3910d86d-2015-4895-a4ad-2f136e7bda7e',
    function: 'Chef',
    name: 'Bart Gils',
    phoneNumber: '0479 / 51 42 19',
    work: 'De Koekoek',
    workCategory: 'HORECA',
    workCategoryPeriod: {
      start: fromYear('2010'),
      end: fromYear('2014'),
    },
  },
  {
    uuid: '00be0fc6-c1b7-48b1-a638-e7f57935b1b6',
    function: 'Chef',
    name: 'Ivan Menten',
    phoneNumber: '0478 / 74 28 56',
    work: 'De Farmasie',
    workCategory: 'HORECA',
    workCategoryPeriod: {
      start: fromYear('2008'),
      end: fromYear('2010'),
    },
  },
  {
    uuid: '11246932-5ca3-4fb2-bdb2-b5b1791a014e',
    function: 'Chef',
    name: 'Vicky Geunes',
    phoneNumber: '03 / 283 40 40',
    work: "'t Zilte",
    workCategory: 'HORECA',
    workCategoryPeriod: {
      start: fromYear('2006'),
      end: fromYear('2008'),
    },
  },
  {
    uuid: 'b8473bfc-b181-4643-ab2e-9248048a7013',
    function: 'Chef',
    name: 'Jean Pierre Bruneau',
    phoneNumber: '02 / 421 70 70',
    work: 'Bruneau',
    workCategory: 'HORECA',
    workCategoryPeriod: {
      start: fromYear('2005'),
      end: fromYear('2006'),
    },
  },
  {
    uuid: '4511689f-d906-4eb7-8b8e-f3432e34bb4e',
    function: 'Chef',
    name: 'Guy Lefevere',
    phoneNumber: '0478 / 25 83 31',
    work: 'La Bergerie',
    workCategory: 'HORECA',
    workCategoryPeriod: {
      start: fromYear('2004'),
      end: fromYear('2005'),
    },
  },
];

const itReferences: Reference[] = [
  {
    uuid: '0df7efef-d5f3-4e30-9555-8f28bf43dd66',
    function: 'People Manager & Lead Front-End Developer',
    name: 'Kevin Jannis',
    work: 'Sopra Steria',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2021'),
    },
  },
  {
    uuid: 'c58d04fa-bae1-4e29-a99d-cfceeca2c781',
    function: 'Digital Factory Lead',
    name: 'Marijke Boye',
    work: 'Sopra Steria',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2021'),
    },
  },
  {
    uuid: '63247627-fdd8-4757-a870-920fa651cf64',
    function: 'Business Unit Manager',
    name: 'Bart Headens',
    work: 'Sopra Steria',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2021'),
    },
  },
  {
    uuid: '3bdae9c4-14dd-43fc-a4f4-1dd18fee9dbf',
    function: 'Lead Front-End Developer',
    name: 'Roel Frison',
    phoneNumber: '0496 / 98 76 86',
    work: 'Sopra Steria',
    client: 'Ravago',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2022'),
      end: fromYear('2026'),
    },
  },
  {
    uuid: 'ff8d0984-e01a-47f6-97e6-1c150744b8c5',
    function: 'Lead Back-End Developer',
    name: 'Lowie Cuypers',
    work: 'Sopra Steria',
    client: 'Ravago',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2022'),
      end: fromYear('2026'),
    },
  },
  {
    uuid: 'cbe15574-e306-470c-a456-821b70fc733a',
    function: 'QA Lead',
    name: 'Bettina Verheyen',
    work: 'Sopra Steria',
    client: 'Ravago',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2022'),
      end: fromYear('2026'),
    },
  },
  {
    uuid: '852dac39-6bf6-4eab-91e4-29e995259071',
    function: 'Lead Full-Stack Developer',
    name: 'Ewald Van Der Veken',
    phoneNumber: '0471 / 10 38 21',
    work: 'Innomedio',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2020'),
      end: fromYear('2021'),
    },
  },
  {
    uuid: '9f303fa0-b394-4e99-8949-b2556eaa1700',
    function: 'Operations & Project Manager',
    name: 'Karen Vermeire',
    work: 'Innomedio',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2020'),
      end: fromYear('2021'),
    },
  },
  {
    uuid: '3a5fd543-81d1-4bfd-928b-11bd99720175',
    function: 'Lead Full-Stack Developer',
    name: 'Tom Bevers',
    phoneNumber: '0473 / 74 20 06',
    work: 'PHPro',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2018'),
      end: fromYear('2020'),
    },
  },
  {
    uuid: '1a634b2e-8a2d-4cea-a95a-daade4bccd48',
    function: 'Team Lead & Lead Front-End Developer',
    name: 'Stef Liekens',
    work: 'PHPro',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2018'),
      end: fromYear('2020'),
    },
  },
];

export const referenceRepository = {
  findAll: (): Reference[] => [...horecaReferences, ...itReferences],
};
