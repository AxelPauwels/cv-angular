import type { PersonFieldsFragment } from '../generated/graphql';
import type { ContactInfo, Hobby, Person } from '../../types/person.types';

type ContactDto = PersonFieldsFragment['contact'];
type HobbyDto = PersonFieldsFragment['hobbies'][number];

export function toPerson(dto: PersonFieldsFragment): Person {
  return {
    id: dto.uuid,
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
    languages: dto.languages.map(({ uuid, ...skill }) => ({
      id: uuid,
      ...skill,
      language: { ...skill.language },
    })),
  };
}

function toContactInfo({ linkedIn, github, ...dto }: ContactDto): ContactInfo {
  return {
    address: { ...dto.address },
    email: dto.email,
    ...(linkedIn ? { linkedIn } : {}),
    ...(github ? { github } : {}),
  };
}

function toHobby({ uuid, comment, ...dto }: HobbyDto): Hobby {
  return { id: uuid, ...dto, ...(comment ? { comment } : {}) };
}
