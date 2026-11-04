import type { Person } from '../generated/resolvers-types';
import { fromDate } from '../utils/date';
import { hobbyRepository } from './hobby.repository';
import { languageSkillRepository } from './language-skill.repository';

const person: Person = {
  firstName: 'Axel',
  lastName: 'Pauwels',
  functionTitle: 'WEB DEVELOPER',
  contact: {
    address: {
      city: 'Geel',
      country: 'belgium',
      number: '25',
      postalCode: '2440',
      street: 'Sint-Gerardusstraat',
    },
    email: 'axelpauwels.be@gmail.com',
    linkedIn: 'https://www.linkedin.com/in/axelpauwels/',
    phone: '0477/968800',
    website: 'https://axel-pauwels-cv.web.app/personal',
  },
  hobbies: hobbyRepository.findAll(),
  languages: languageSkillRepository.findAll(),
  personal: {
    children: [{ name: 'Jade', gender: 'FEMALE' }],
    dateOfBirth: fromDate('1986-01-02'),
    driverLicense: 'B',
    maritalStatus: 'MARRIED',
    nationality: 'BE',
    personalityType: 'INTJ',
  },
};

export const personRepository = {
  get: (): Person => person,
};
