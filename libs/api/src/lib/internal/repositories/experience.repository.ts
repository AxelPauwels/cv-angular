import type { Experience } from '../generated/resolvers-types';
import { fromYear } from '../utils/date';

const horecaExperiences: Experience[] = [
  {
    category: 'HORECA',
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
      start: fromYear('2021'),
    },
    work: {
      location: 'Arendonk',
      name: 'Sopra Steria: Ravago',
      // position: 'Consultant Frontend Developer',
      position: 't.experience.work-position.ravago',
    },
    // jobDescriptions: [
    //   'Technologie: Angular met NX en het UI framework Kendo',
    //   'Projecten: Meegewerkt aan Warehouse Management System. Een custom web-gebaseerd. Een custom web-gebaseerd software systeem voor desktop (office) in combinatie met een mobile systeem (magazijn). Dit voor het volledig beheren van stock en productie, zowel voor het verwerken van orders in office, als magazijniers met een scanner.',
    // ],
    jobDescriptions: [
      't.experience.job-description.ravago.technologies',
      't.experience.job-description.ravago.projects',
    ],
  },
  {
    category: 'IT',
    isInternship: false,
    period: {
      start: fromYear('2020'),
      end: fromYear('2021'),
    },
    work: {
      location: 'Malle',
      name: 'Innomedio',
      // position: 'PHP / Support Developer',
      position: 't.experience.work-position.innomedio',
    },
    // jobDescriptions: [
    //   'Technologie: Custom ontwikkelde CMS systemen onderhouden en uitbreiden. Telefonie voor support en het beheren van het ticketsysteem.',
    //   'Projecten: Meegewerkt aan Dobit, Lalys-astene, Allodium, Goetstouwers, Dego,...',
    // ],
    jobDescriptions: [
      't.experience.job-description.innomedio.technologies',
      't.experience.job-description.innomedio.projects',
    ],
  },
  {
    category: 'IT',
    isInternship: false,
    period: {
      start: fromYear('2018'),
      end: fromYear('2020'),
    },
    work: {
      location: 'Kontich',
      name: 'PHPro',
      // position: 'PHP / Frontend Developer',
      position: 't.experience.work-position.phpro',
    },
    // jobDescriptions: [
    //   'Technologie: Voornamelijk Magento 2. Een beetje React en Sulu. Verdiept in front-end ITCSS van SEM&BIO in Sass.',
    //   'Projecten: Meegewerkt aan Pizzahut, Hopper, Euroshop, Vinetiq, VAR, ...',
    // ],
    jobDescriptions: [
      't.experience.job-description.phpro.technologies',
      't.experience.job-description.phpro.projects',
    ],
  },
  {
    category: 'IT',
    isInternship: true,
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
