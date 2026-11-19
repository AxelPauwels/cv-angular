import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import {
  FormatSimple,
  provideTolgee,
  Tolgee,
  TranslateService,
} from '@tolgee/ngx';
import { TranslatedTitleStrategy } from './translated-title-strategy';

@Component({ template: '' })
class Page {}

describe('TranslatedTitleStrategy', () => {
  let announced: string[];

  beforeEach(() => {
    announced = [];
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee()
            .use(FormatSimple())
            .init({
              language: 'en',
              staticData: {
                en: { 't.nav.skills': 'skills', 't.nav.versions': 'Versions' },
                nl: { 't.nav.skills': 'vaardigheden' },
              },
            })
        ),
        provideRouter([
          { path: 'skills', title: 't.nav.skills', component: Page },
          { path: 'versions', title: 't.nav.versions', component: Page },
          { path: 'untitled', component: Page },
        ]),
        { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
        {
          provide: LiveAnnouncer,
          useValue: {
            announce: (text: string) => {
              announced.push(text);
              return Promise.resolve();
            },
          },
        },
      ],
    });
  });

  async function go(url: string): Promise<void> {
    await TestBed.inject(Router).navigateByUrl(url);
    // the translation arrives asynchronously
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  const title = () => TestBed.inject(Title).getTitle();

  it('titles the page with its translated, capitalized label and the name', async () => {
    // Act
    await go('/skills');

    // Assert
    expect(title()).toBe('Skills · Axel Pauwels');
  });

  it('uses the name alone for a page without a title', async () => {
    // Act
    await go('/untitled');

    // Assert
    expect(title()).toBe('Axel Pauwels');
  });

  it('announces every page but the first one the visitor lands on', async () => {
    // Act
    await go('/skills');
    await go('/versions');

    // Assert
    expect(announced).toEqual(['Versions · Axel Pauwels']);
  });

  it('translates the title again on a language change, without announcing it', async () => {
    // Arrange
    await go('/skills');
    await go('/versions');
    await go('/skills');
    announced = [];

    // Act
    await TestBed.inject(TranslateService).changeLanguage('nl');
    await new Promise((resolve) => setTimeout(resolve));

    // Assert
    expect(title()).toBe('Vaardigheden · Axel Pauwels');
    expect(announced).toEqual([]);
  });
});
