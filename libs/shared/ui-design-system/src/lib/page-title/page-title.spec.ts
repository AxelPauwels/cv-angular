import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { PageTitle } from './page-title';

@Component({
  imports: [PageTitle],
  template: `<ds-page-title title="t.heading.references" />`,
})
class Host {}

describe('PageTitle', () => {
  it('renders the translated title as the level-one heading', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: { en: { 't.heading.references': 'References' } },
          })
        ),
      ],
    });

    // Act
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    // Assert
    const headings = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'h1'
    );
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('References');
  });
});
