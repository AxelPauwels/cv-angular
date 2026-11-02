import { Person } from '../models';

// Mock data
const people: Person[] = [
  { id: '1', name: 'Alice Janssens', age: 34 },
  { id: '2', name: 'Bram Peeters', age: 28 },
  { id: '3', name: 'Charlotte Maes', age: 41 },
];

export const personRepository = {
  findAll: (): Person[] => people,
  findById: (id: string): Person | undefined =>
    people.find((person) => person.id === id),
};
