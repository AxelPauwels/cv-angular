import type { PersonFieldsFragment } from '../generated/graphql';
import type { ContactInfo, Hobby, Person } from '../../types/person.types';

type ContactDto = PersonFieldsFragment['contact'];
type HobbyDto = PersonFieldsFragment['hobbies'][number];

export function toPerson(dto: PersonFieldsFragment): Person {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    functionTitle: dto.functionTitle,
    contact: toContactInfo(dto.contact),
    personal: {
      ...dto.personal,
      dateOfBirth: new Date(dto.personal.dateOfBirth),
      children: dto.personal.children.map((child) => ({ ...child })),
    },
    hobbies: dto.hobbies.map(toHobby),
    languages: dto.languages.map((skill) => ({
      ...skill,
      language: { ...skill.language },
    })),
  };
}

function toContactInfo({ website, linkedIn, ...dto }: ContactDto): ContactInfo {
  return {
    address: { ...dto.address },
    phone: dto.phone,
    email: dto.email,
    ...(website ? { website } : {}),
    ...(linkedIn ? { linkedIn } : {}),
  };
}

function toHobby({ comment, ...dto }: HobbyDto): Hobby {
  return { ...dto, ...(comment ? { comment } : {}) };
}
