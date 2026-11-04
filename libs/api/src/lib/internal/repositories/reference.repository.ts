import type { Reference } from '../generated/resolvers-types';
import { fromYear } from '../utils/date';

const horecaReferences: Reference[] = [
  {
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
    function: 'Front-end Lead',
    name: 'Roel Frison',
    phoneNumber: '0496 / 98 76 86',
    work: 'Ravago',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2021'),
    },
  },
  {
    function: 'Business Unit Manager',
    name: 'Bart Headens',
    phoneNumber: 'N/A yet',
    work: 'Sopra Steria',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2021'),
    },
  },
  {
    function: 'People Manager',
    name: 'Marijke Boye',
    phoneNumber: 'N/A yet',
    work: 'Sopra Steria',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2021'),
    },
  },
  {
    function: 'Lead Developer',
    name: 'Ewald Van der veken',
    phoneNumber: '0471 / 10 38 21',
    work: 'Innomedio',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: fromYear('2020'),
      end: fromYear('2021'),
    },
  },
  {
    function: 'Front-end Lead Developer',
    name: 'Tom Bevers',
    phoneNumber: '0473 / 74 20 06',
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
