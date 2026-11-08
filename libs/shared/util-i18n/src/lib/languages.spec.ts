import type {
  HeadingTranslationKey,
  LanguageTranslationKey,
  NavTranslationKey,
  SubheadingTranslationKey,
  TranslationKey,
} from './languages';

describe('translation keys', () => {
  it('accepts keys of their own group', () => {
    // Arrange
    type Nav = 't.nav.cv';
    type Language = 't.language.dutch';
    type Heading = 't.heading.experience';
    type Subheading = 't.subheading.skills';

    // Act
    const nav = expectTypeOf<Nav>();
    const language = expectTypeOf<Language>();
    const heading = expectTypeOf<Heading>();
    const subheading = expectTypeOf<Subheading>();

    // Assert
    nav.toExtend<NavTranslationKey>();
    language.toExtend<LanguageTranslationKey>();
    heading.toExtend<HeadingTranslationKey>();
    subheading.toExtend<SubheadingTranslationKey>();
  });

  it('rejects keys of another group', () => {
    // Arrange
    type Heading = 't.heading.experience';
    type Nav = 't.nav.cv';

    // Act
    const heading = expectTypeOf<Heading>();
    const nav = expectTypeOf<Nav>();

    // Assert
    heading.not.toExtend<NavTranslationKey>();
    nav.not.toExtend<LanguageTranslationKey>();
  });

  it('makes every group a translation key', () => {
    // Arrange
    type Groups =
      | NavTranslationKey
      | LanguageTranslationKey
      | HeadingTranslationKey
      | SubheadingTranslationKey;

    // Act
    const groups = expectTypeOf<Groups>();

    // Assert
    groups.toExtend<TranslationKey>();
  });

  it('requires the t. root', () => {
    // Arrange
    type WithoutRoot = 'nav.cv';

    // Act
    const key = expectTypeOf<WithoutRoot>();

    // Assert
    key.not.toExtend<TranslationKey>();
  });
});
