import type { LanguageIsoCode } from '../generated/resolvers-types';
import { languageRepository } from './language.repository';

describe('languageRepository', () => {
  it('lists English, Dutch and French', () => {
    // Act
    const languages = languageRepository.findAll();

    // Assert
    expect(languages.map(({ isoCode }) => isoCode)).toEqual(['EN', 'NL', 'FR']);
  });

  it('finds a language by its iso code', () => {
    // Act
    const language = languageRepository.findByIsoCode('NL');

    // Assert
    expect(language).toEqual({ isoCode: 'NL', locale: 'NL_BE' });
  });

  it('falls back to English for a language without a locale', () => {
    // Arrange
    const unknown = 'XX' as LanguageIsoCode;

    // Act
    const language = languageRepository.findByIsoCode(unknown);

    // Assert
    expect(language).toEqual({ isoCode: 'EN', locale: 'EN_US' });
  });
});
