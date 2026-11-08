import type { Experience } from '../generated/resolvers-types';
import { fromDate, fromYear } from '../utils/date';

const horecaExperiences: Experience[] = [
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2014'),
      end: fromYear('2015'),
    },
    work: {
      location: 'Turnhout',
      name: 'De Koekoek',
      // position: 'Chef',
      position: 't.experience.work-position.koekoek-2',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2013'),
      end: fromYear('2014'),
    },
    work: {
      location: 'Kasterlee',
      name: 'Den Cardijn',
      // position: 'Sous-chef',
      position: 't.experience.work-position.cardijn',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2010'),
      end: fromYear('2013'),
    },
    work: {
      location: 'Turnhout',
      name: 'De Koekoek',
      // position: 'Sous-chef / Chef',
      position: 't.experience.work-position.koekoek',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2008'),
      end: fromYear('2010'),
    },
    work: {
      location: 'Vosselaar',
      name: 'De Farmasie',
      // position: 'Sous-chef / Pâtissier',
      position: 't.experience.work-position.farmasie',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2006'),
      end: fromYear('2008'),
    },
    work: {
      location: 'Mol',
      name: "'t Zilte",
      // position: 'Chef de partie / Pâtissier',
      position: 't.experience.work-position.zilte',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2005'),
      end: fromYear('2006'),
    },
    work: {
      location: 'Ganshoren - Brussel',
      name: 'Bruneau',
      // position: 'Chef de partie / Pâtissier',
      position: 't.experience.work-position.bruneau',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: false,
    period: {
      start: fromYear('2004'),
      end: fromYear('2005'),
    },
    work: {
      location: 'Lives-Sur-Meuse',
      name: 'La Bergerie',
      // position: 'Garde manger / Pâtissier',
      position: 't.experience.work-position.bergerie',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: true,
    period: {
      start: fromYear('2004'),
    },
    work: {
      location: 'Lives-Sur-Meuse',
      name: 'La Bergerie',
      // position: 'Stagiair keuken',
      position: 't.experience.work-position.bergerie-stage',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: true,
    period: {
      start: fromYear('2003'),
    },
    work: {
      location: 'Ovifat Waimes',
      name: 'Domaine Des Hautes Fagnes',
      // position: 'Stagiair keuken',
      position: 't.experience.work-position.domaine-des-hautes-fagnes',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: true,
    period: {
      start: fromYear('2002'),
    },
    work: {
      location: 'Oud-Turnhout',
      name: 'De Nieuwen Buiten',
      // position: 'Stagiair Keuken',
      position: 't.experience.work-position.nieuwen-buiten',
    },
  },
  {
    category: 'HORECA',
    stack: [],
    isInternship: true,
    period: {
      start: fromYear('2001'),
    },
    work: {
      location: 'Lichtaart',
      name: 'De Residentie',
      // position: 'Stagiair Zaal',
      position: 't.experience.work-position.residentie',
    },
  },
];

const itExperiences: Experience[] = [
  {
    category: 'IT',
    isInternship: false,
    period: {
      start: fromDate('2022-01-01'),
      end: fromDate('2026-10-01'),
    },
    work: {
      location: 'Arendonk',
      name: 'Sopra Steria > Ravago',
      // position: 'Senior Angular Developer',
      position: 't.experience.work-position.ravago',
    },
    // project: 'Warehouse Management System',
    project: 't.experience.project.ravago',
    jobDescriptions: [
      't.experience.job-description.ravago.wms',
      't.experience.job-description.ravago.platform',
      't.experience.job-description.ravago.workflows',
      't.experience.job-description.ravago.projects',
    ],
    stack: [
      'Angular',
      'TypeScript',
      'Nx',
      'RxJS',
      'Signals',
      'GraphQL',
      'Apollo',
      'Kendo UI',
      'Scss',
      'Git',
      'Copilot',
      'Cursor',
      'Claude Code',
    ],
  },
  {
    category: 'IT',
    isInternship: false,
    period: {
      start: fromDate('2021-09-01'),
      end: fromDate('2021-12-01'),
    },
    work: {
      location: 'Mechelen',
      name: 'Sopra Steria (Ordina)',
      // position: 'Front-End Developer',
      position: 't.experience.work-position.ordina',
    },
    // project: 'Professional Programme',
    project: 't.experience.project.ordina',
    jobDescriptions: [
      't.experience.job-description.ordina.programme',
      't.experience.job-description.ordina.projects',
    ],
    stack: [
      'Angular',
      'TypeScript',
      'Nx',
      'RxJS',
      'NestJS',
      'Material Design',
      'Scss',
      'Git',
      'Jira',
    ],
  },
  {
    category: 'IT',
    isInternship: false,
    period: {
      start: fromDate('2020-07-01'),
      end: fromDate('2021-08-01'),
    },
    work: {
      location: 'Malle',
      name: 'Innomedio',
      // position: 'PHP Support / Front-End Developer',
      position: 't.experience.work-position.innomedio',
    },
    jobDescriptions: [
      't.experience.job-description.innomedio.websites',
      't.experience.job-description.innomedio.support',
      't.experience.job-description.innomedio.projects',
    ],
    stack: [
      'PHP',
      'Symfony',
      'Sulu',
      'Sass',
      'Vagrant',
      'MySQL',
      'Git',
      'Capistrano',
    ],
  },
  {
    category: 'IT',
    isInternship: false,
    period: {
      start: fromDate('2018-11-01'),
      end: fromDate('2020-06-01'),
    },
    work: {
      location: 'Kontich',
      name: 'PHPro',
      // position: 'PHP Front-End Developer',
      position: 't.experience.work-position.phpro',
    },
    jobDescriptions: [
      't.experience.job-description.phpro.magento',
      't.experience.job-description.phpro.front-end',
      't.experience.job-description.phpro.agile',
      't.experience.job-description.phpro.projects',
    ],
    stack: [
      'Magento 2',
      'PHP',
      'Sass',
      'React',
      'Sulu',
      'MySQL',
      'Bitbucket',
      'SEM & BIO',
    ],
  },
  {
    category: 'IT',
    isInternship: true,
    stack: [],
    period: {
      start: fromYear('2018'),
    },
    work: {
      location: 'Westerlo - Oevel',
      name: '3-it',
      // position: 'Stagiair Frontend Developer',
      position: 't.experience.work-position.3-it',
    },
  },
];

export const experienceRepository = {
  findAll: (): Experience[] => [...horecaExperiences, ...itExperiences],
};
