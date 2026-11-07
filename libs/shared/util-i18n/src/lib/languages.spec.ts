import type {
  HeadingTranslationKey,
  LanguageTranslationKey,
  NavTranslationKey,
  SubheadingTranslationKey,
  TranslationKey,
} from './languages';

describe('translation keys', () => {
  it('accepts keys of their own group', () => {
    // Act & Assert
    expectTypeOf<'t.nav.cv'>().toExtend<NavTranslationKey>();
    expectTypeOf<'t.language.dutch'>().toExtend<LanguageTranslationKey>();
    expectTypeOf<'t.heading.experience'>().toExtend<HeadingTranslationKey>();
    expectTypeOf<'t.subheading.skills'>().toExtend<SubheadingTranslationKey>();
  });

  it('rejects keys of another group', () => {
    // Act & Assert
    expectTypeOf<'t.heading.experience'>().not.toExtend<NavTranslationKey>();
    expectTypeOf<'t.nav.cv'>().not.toExtend<LanguageTranslationKey>();
  });

  it('makes every group a translation key', () => {
    // Act & Assert
    expectTypeOf<NavTranslationKey>().toExtend<TranslationKey>();
    expectTypeOf<LanguageTranslationKey>().toExtend<TranslationKey>();
    expectTypeOf<HeadingTranslationKey>().toExtend<TranslationKey>();
    expectTypeOf<SubheadingTranslationKey>().toExtend<TranslationKey>();
  });

  it('requires the t. root', () => {
    // Act & Assert
    expectTypeOf<'nav.cv'>().not.toExtend<TranslationKey>();
  });
});
