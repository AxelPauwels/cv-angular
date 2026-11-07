import { DOCUMENT, effect, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@tolgee/ngx';
import {
  DEFAULT_LANGUAGE,
  isLanguageCode,
  LANGUAGES,
  LanguageCode,
} from './languages';

/** Where Tolgee's LanguageStorage plugin keeps the chosen language */
const LANGUAGE_KEY = '__tolgee_currentLanguage';

/**
 * The active language as a signal; keeps `<html lang>` in sync. Tolgee remembers the
 * choice (LanguageStorage, see provideI18n); without one it detects the browser
 * language.
 */
@Service()
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  readonly languages = LANGUAGES;

  readonly language = toSignal(this.translate.languageAsync, {
    initialValue: this.translate.language || DEFAULT_LANGUAGE,
  });

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.language();
    });
  }

  changeLanguage(code: LanguageCode): Promise<void> {
    return this.translate.changeLanguage(code);
  }

  /** Back to the browser language (else English), and forgets the choice */
  async resetLanguage(): Promise<void> {
    await this.translate.changeLanguage(this.browserLanguage());
    // changing the language saved it again: forget it, so detection runs next visit
    try {
      this.window?.localStorage.removeItem(LANGUAGE_KEY);
    } catch {
      // storage unavailable: nothing was saved
    }
  }

  /** Like Tolgee's LanguageDetector: `nl-BE` matches `nl` */
  private browserLanguage(): LanguageCode {
    const browser = this.window?.navigator.language ?? '';
    const base = browser.split('-')[0];
    return isLanguageCode(browser)
      ? browser
      : isLanguageCode(base)
        ? base
        : DEFAULT_LANGUAGE;
  }
}
