import type { LanguageSkill } from '../generated/resolvers-types';
import { languageRepository } from './language.repository';

const languageSkills: LanguageSkill[] = [
  {
    uuid: '93bed3b8-55a5-47ce-9bd6-2661b2af3129',
    isNativeLanguage: true,
    language: languageRepository.findByIsoCode('NL'),
    spoken: 'EXCELLENT',
    written: 'EXCELLENT',
  },
  {
    uuid: 'cd1276f0-e231-46c6-9fba-c9c65fbf6551',
    isNativeLanguage: false,
    language: languageRepository.findByIsoCode('EN'),
    spoken: 'VERY_GOOD',
    written: 'GOOD',
    cefrLevel: 'B2',
  },
  {
    uuid: 'aa1e2251-14c0-487a-8031-d137eeb7cb48',
    isNativeLanguage: false,
    language: languageRepository.findByIsoCode('FR'),
    spoken: 'BASIC',
    written: 'BASIC',
    cefrLevel: 'A1',
  },
];

export const languageSkillRepository = {
  findAll: (): LanguageSkill[] => languageSkills,
};
