import type { Experience } from '../generated/resolvers-types';
import { fromDate, fromYear } from '../utils/date';

const horecaExperiences: Experience[] = [
  {
    uuid: '62cf8ed0-2f1a-4ba6-a965-577e7cb7b490',
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
    uuid: '6a7cbcd1-44c1-47c1-b2ae-297ca0f3859f',
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
    uuid: '67c3555d-a416-405e-b52b-095db820920f',
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
    uuid: 'edcbd212-8253-41ff-891c-36e8a38da0fc',
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
    uuid: '6e929ade-cc0a-4eef-be26-34a1141334e8',
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
    uuid: '351bd364-25d6-4f6e-8bb9-857b52e69010',
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
    uuid: '8d87c332-bb07-4203-bfd1-2f5eeba7aefe',
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
    uuid: '9eb94128-d00f-4227-9099-ed10f3ed24b6',
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
    uuid: 'd390af68-f8a6-41e4-957d-2cb01f89c30e',
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
    uuid: '8f9418e2-1208-48f1-bc35-f82812c5e22e',
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
    uuid: 'a03b5d26-a851-4bf3-8f76-c53219795f9a',
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
    uuid: '306f7048-e1c0-48a0-a4a3-a85b80345c0c',
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
    uuid: 'e847b20a-fb95-4f70-a41b-5f0fc782601f',
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
    uuid: '6f97e3a0-8d7a-4a74-b6bd-2f798db045f9',
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
    uuid: 'db6e9c29-646d-486e-a609-19747b01bb40',
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
    uuid: 'e7c41efa-e6b6-447d-84bf-7d88c848f99b',
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
