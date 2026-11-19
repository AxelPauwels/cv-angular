import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormatSimple,
  provideTolgee,
  Tolgee,
  TranslateService,
} from '@tolgee/ngx';
import { TranslateListPipe } from './translate-list.pipe';

@Component({
  imports: [TranslateListPipe],
  template: `<ol>
    @for (item of 't.steps' | translateList; track $index) {
      <li>
        @for (part of item; track $index) {
          @if (part.tag === 'code') {
            <code>{{ part.text }}</code>
          } @else {
            {{ part.text }}
          }
        }
      </li>
    }
  </ol>`,
})
class Host {
  readonly translate = inject(TranslateService);
}

describe('TranslateListPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee()
            .use(FormatSimple())
            .init({
              language: 'en',
              staticData: {
                en: {
                  't.steps': 'Run <code>npm ci</code> first.||Build.||Ship.',
                },
                nl: {
                  't.steps': 'Draai eerst <code>npm ci</code> uit.||Bouw.',
                },
              },
            })
        ),
      ],
    });
  });

  function items(fixture: { nativeElement: HTMLElement }): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('li')).map(
      (li) => li.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    );
  }

  it('renders one item per entry, with inline code as an element', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    await fixture.whenStable();

    // Assert
    expect(items(fixture)).toEqual(['Run npm ci first.', 'Build.', 'Ship.']);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('li code')
        ?.textContent
    ).toBe('npm ci');
  });

  it('follows a language change, also when the number of items differs', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    // Act
    await fixture.componentInstance.translate.changeLanguage('nl');
    await fixture.whenStable();

    // Assert
    expect(items(fixture)).toEqual(['Draai eerst npm ci uit.', 'Bouw.']);
  });
});
