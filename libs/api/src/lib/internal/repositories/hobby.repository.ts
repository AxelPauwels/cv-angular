import type { Hobby } from '../generated/resolvers-types';

const hobbies: Hobby[] = [
  {
    uuid: 'f4f4a4d0-ff65-4325-94d7-5e2f396ff0c6',
    name: 't.personal.hobby.binge-watching',
    icon: 'tv',
  },
  {
    uuid: 'e0df3729-c53f-4314-8173-50c8be09be6a',
    name: 't.personal.hobby.board-games',
    icon: 'board-games',
  },
  {
    uuid: '78957dbf-1538-45ae-8261-55342a40c4ed',
    name: 't.personal.hobby.mtg',
    icon: 'mtg',
  },
  {
    uuid: '8092f8f9-7b00-441a-921b-0f313ee44fa0',
    name: 't.personal.hobby.rubik-s-cube-competitions',
    icon: 'rubik',
  },
  {
    uuid: 'debb9956-1b61-44bb-9c1a-860897761e88',
    name: 't.personal.hobby.member-of-wca',
    icon: 'wca',
    comment: 't.personal.hobby.comment.world-cube-association',
  },
  {
    uuid: 'dbcc1f7a-2013-40c0-a651-d30fc076f482',
    name: 't.personal.hobby.member-of-vsk',
    icon: 'shooting',
    comment: 't.personal.hobby.comment.vlaamse-schietsport-koepel',
  },
];

export const hobbyRepository = {
  findAll: (): Hobby[] => hobbies,
};
