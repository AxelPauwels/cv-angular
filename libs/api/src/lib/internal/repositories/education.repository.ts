import type { Education } from '../generated/resolvers-types';
import { fromYear } from '../utils/date';

const secondaryEducations: Education[] = [
  {
    level: 'SECONDARY_EDUCATION',
    period: {
      start: fromYear('1998'),
      end: fromYear('2000'),
    },
    school: {
      name: 'Sint Jozefs Instituut',
      location: 'Geel',
    },
    // specialization: 'Hotel TSO',
    specialization: 't.education.sint-jozef.specialization',
  },
  {
    // degree: 'Diploma of Secondary Education',
    degree: 't.education.school.ter-duinen.degree',
    level: 'SECONDARY_EDUCATION',
    period: {
      start: fromYear('2000'),
      end: fromYear('2004'),
    },
    school: {
      name: 'Hotelschool Ter Duinen',
      location: 'Koksijde',
    },
    // specialization: 'Hotel TSO',
    specialization: 't.education.ter-duinen.specialization',
  },
];

const customEducations: Education[] = [
  {
    // degree: 'Diploma of pulled sugar | Diploma of poured & blown sugar',
    degree: 't.education.bellouet-conseil.degree',
    level: 'CUSTOM_COURSE',
    period: {
      start: fromYear('2005'),
    },
    school: {
      name: 'Bellouet Conseil',
      location: 't.city.paris',
    },
    // specialization: 'Sucre tiré, coulé, soufflé',
    specialization: 't.education.bellouet-conseil.specialization',
  },
];

const highSchoolEducations: Education[] = [
  {
    // degree: 'Professionele bachelor in Toegepaste Informatica',
    degree: 't.education.thomas-more.degree',
    level: 'HIGH_SCHOOL',
    period: {
      start: fromYear('2015'),
      end: fromYear('2018'),
    },
    school: {
      name: 'Thomas More Kempen',
      location: 'Geel',
    },
    // specialization: 'IT Factory Applications',
    specialization: 't.education.thomas-more.specialization',
  },
];

export const educationRepository = {
  findAll: (): Education[] => [
    ...secondaryEducations,
    ...customEducations,
    ...highSchoolEducations,
  ],
};
