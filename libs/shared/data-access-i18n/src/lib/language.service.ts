import { DOCUMENT, effect, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@tolgee/ngx';
import { DEFAULT_LANGUAGE, LANGUAGES, LanguageCode } from './languages';

/** The active language as a signal; keeps `<html lang>` in sync */
@Service()
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

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
}
