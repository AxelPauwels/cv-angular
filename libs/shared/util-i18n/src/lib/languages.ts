export type TranslationKey = `t.${string}`;

export type NavTranslationKey = `t.nav.${string}`;
export type LanguageTranslationKey = `t.language.${string}`;

export type HeadingTranslationKey = `t.heading.${string}`;
/**
 * The `<h1>` of a page: its menu label (`t.nav.*`) when the heading says the
 * same, so both share one Tolgee key, or a `t.heading.*` key when it differs
 */
export type PageTitleTranslationKey = HeadingTranslationKey | NavTranslationKey;
export type SubheadingTranslationKey = `t.subheading.${string}`; // For subheadings, categories, sections, ...
