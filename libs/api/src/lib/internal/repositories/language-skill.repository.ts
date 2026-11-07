import type { LanguageSkill } from '../generated/resolvers-types';
import { languageRepository } from './language.repository';

const languageSkills: LanguageSkill[] = [
  {
    isNativeLanguage: true,
    language: languageRepository.findByIsoCode('NL'),
    spoken: 'EXCELLENT',
    written: 'EXCELLENT',
  },
  {
    isNativeLanguage: false,
    language: languageRepository.findByIsoCode('EN'),
    spoken: 'VERY_GOOD',
    written: 'GOOD',
    cefrLevel: 'B2',
  },
  {
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
