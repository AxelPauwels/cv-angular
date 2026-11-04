import type { Hobby } from '../generated/resolvers-types';

const hobbies: Hobby[] = [
  {
    name: 't.personal.hobby.binge-watching',
    icon: 'tv',
  },
  {
    name: 't.personal.hobby.board-games',
    icon: 'board-games',
  },
  {
    name: 't.personal.hobby.mtg',
    icon: 'mtg',
  },
  {
    name: 't.personal.hobby.rubik-s-cube-competitions',
    icon: 'rubik',
  },
  {
    name: 't.personal.hobby.member-of-wca',
    icon: 'wca',
    comment: 't.personal.hobby.comment.world-cube-association',
  },
  {
    name: 't.personal.hobby.member-of-vsk',
    icon: 'shooting',
    comment: 't.personal.hobby.comment.vlaamse-schietsport-koepel',
  },
];

export const hobbyRepository = {
  findAll: (): Hobby[] => hobbies,
};
