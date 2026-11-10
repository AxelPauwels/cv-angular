import type { Person } from '../generated/resolvers-types';
import { fromDate } from '../utils/date';
import { hobbyRepository } from './hobby.repository';
import { languageSkillRepository } from './language-skill.repository';

const person: Person = {
  uuid: '057a3b0c-7418-4ef8-94b1-5548943990a4',
  firstName: 'Axel',
  lastName: 'Pauwels',
  functionTitle: 'Senior Angular Front-End Developer',
  profile: 't.personal.profile',
  contact: {
    address: {
      city: 'Geel',
      country: 'belgium',
      number: '25',
      postalCode: '2440',
      street: 'Sint-Gerardusstraat',
    },
    email: 'axelpauwels.be@gmail.com',
    github: 'https://github.com/AxelPauwels',
    linkedIn: 'https://www.linkedin.com/in/axelpauwels/',
    phone: '+32 477 96 88 00',
    website: 'https://axel-pauwels-cv.web.app/personal',
  },
  hobbies: hobbyRepository.findAll(),
  languages: languageSkillRepository.findAll(),
  personal: {
    partnerName: 'Stefanie',
    children: [{ name: 'Jade', gender: 'FEMALE' }],
    dateOfBirth: fromDate('1986-01-02'),
    maritalStatus: 'MARRIED',
    nationality: 'BE',
    personalityType: 'INTJ',
  },
};

export const personRepository = {
  get: (): Person => person,
};
