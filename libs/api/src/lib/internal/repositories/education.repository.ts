import type { Education } from '../generated/resolvers-types';
import { fromYear } from '../utils/date';

const secondaryEducations: Education[] = [
  {
    uuid: '8a7701aa-8b75-4130-a8c0-f9b64127bcf2',
    category: 'HORECA',
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
    uuid: '735739d1-5a3c-474f-869f-0ac13dbe14ff',
    // degree: 'Diploma of Secondary Education',
    degree: 't.education.school.ter-duinen.degree',
    category: 'HORECA',
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
    uuid: '47df961a-f4aa-4196-bbca-6108b8f99712',
    // degree: 'Diploma of pulled sugar | Diploma of poured & blown sugar',
    degree: 't.education.bellouet-conseil.degree',
    category: 'HORECA',
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
    uuid: '5b3d7ba4-1333-4b94-92a6-e45ca63a8e72',
    // degree: 'Professionele bachelor in Toegepaste Informatica',
    degree: 't.education.thomas-more.degree',
    category: 'IT',
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
