import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@tolgee/ngx';
import { firstValueFrom } from 'rxjs';
import { LanguageService } from './language.service';
import { provideI18n } from './provide-i18n';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideI18n()] });
  });

  async function start() {
    const translate = TestBed.inject(TranslateService);
    await translate.start();
    return { service: TestBed.inject(LanguageService), translate };
  }

  it('offers en, nl, fr and es', async () => {
    const { service } = await start();
    expect(service.languages.map((language) => language.code)).toEqual([
      'en',
      'nl',
      'fr',
      'es',
    ]);
  });

  it('loads a language lazily, switches to it and updates <html lang>', async () => {
    const { service, translate } = await start();

    await service.changeLanguage('nl');
    TestBed.tick();

    expect(service.language()).toBe('nl');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('nl');
    expect(
      // noWrap: without the invisible markers DevTools add in dev mode
      await firstValueFrom(
        translate.translate('t.nav.experience', { noWrap: true })
      )
    ).toBe('Ervaring');
  });

  it('remembers the chosen language for the next visit', async () => {
    const { service } = await start();
    await service.changeLanguage('fr');

    expect(Object.values({ ...localStorage })).toContain('fr');
  });
});
