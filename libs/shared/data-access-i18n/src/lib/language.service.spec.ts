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
    // Arrange & Act
    const { service } = await start();

    // Assert
    expect(service.languages.map((language) => language.code)).toEqual([
      'en',
      'nl',
      'fr',
      'es',
    ]);
  });

  it('loads a language lazily, switches to it and updates <html lang>', async () => {
    // Arrange
    const { service, translate } = await start();

    // Act
    await service.changeLanguage('nl');
    TestBed.tick();

    // Assert
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
    // Arrange & Act
    const { service } = await start();
    await service.changeLanguage('fr');

    // Assert
    expect(Object.values({ ...localStorage })).toContain('fr');
  });

  it('resets to the browser language and forgets the choice', async () => {
    // Arrange
    const { service } = await start();
    const browser = navigator.language.split('-')[0];
    const expected = service.languages.some((l) => l.code === browser)
      ? browser
      : 'en';
    await service.changeLanguage(expected === 'fr' ? 'nl' : 'fr');

    // Act
    await service.resetLanguage();

    // Assert
    expect(service.language()).toBe(expected);
    expect(localStorage.getItem('__tolgee_currentLanguage')).toBeNull();
  });
});
