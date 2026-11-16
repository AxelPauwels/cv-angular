import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormatSimple,
  provideTolgee,
  Tolgee,
  TranslateService,
} from '@tolgee/ngx';
import { toTranslationParts, TranslatePartsPipe } from './translate-parts.pipe';

@Component({
  imports: [TranslatePartsPipe],
  template: `<p>
    @for (part of 't.run' | translateParts: { what: what() }; track $index) {
      @if (part.tag === 'code') {
        <code>{{ part.text }}</code>
      } @else if (part.tag === 'strong') {
        <strong>{{ part.text }}</strong>
      } @else {
        {{ part.text }}
      }
    }
  </p>`,
})
class Host {
  readonly what = signal('tests');
  readonly translate = inject(TranslateService);
}

describe('toTranslationParts', () => {
  it('splits inline code and strong text from the rest', () => {
    // Arrange
    const text = 'Run <code>npm test</code> for <strong>all</strong> libs.';

    // Act
    const parts = toTranslationParts(text);

    // Assert
    expect(parts).toEqual([
      { text: 'Run ' },
      { text: 'npm test', tag: 'code' },
      { text: ' for ' },
      { text: 'all', tag: 'strong' },
      { text: ' libs.' },
    ]);
  });

  it('keeps other tags as plain text', () => {
    // Arrange
    const text = 'A <script>alert(1)</script> and <em>b</em>';

    // Act
    const parts = toTranslationParts(text);

    // Assert
    expect(parts).toEqual([{ text }]);
  });
});

describe('TranslatePartsPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee()
            .use(FormatSimple())
            .init({
              language: 'en',
              staticData: {
                en: { 't.run': 'Run <code>npm test</code> for {what}.' },
                nl: { 't.run': 'Voer <code>npm test</code> uit voor {what}.' },
              },
            })
        ),
      ],
    });
  });

  it('renders the code as an element and the rest as text', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    await fixture.whenStable();

    // Assert
    const p = (fixture.nativeElement as HTMLElement).querySelector('p');
    expect(p?.querySelector('code')?.textContent).toBe('npm test');
    expect(p?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Run npm test for tests.'
    );
  });

  it('follows a language change', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    // Act
    await fixture.componentInstance.translate.changeLanguage('nl');
    await fixture.whenStable();

    // Assert
    const p = (fixture.nativeElement as HTMLElement).querySelector('p');
    expect(p?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Voer npm test uit voor tests.'
    );
  });
});
