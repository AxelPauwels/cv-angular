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

@Component({
  imports: [PageTitle],
  template: `<ds-page-title
    title="t.heading.administrator"
    subtitle="t.subheading.administrator" />`,
})
class HostWithSubtitle {}

describe('PageTitle with a subtitle', () => {
  it('groups the heading with its subtitle', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                't.heading.administrator': 'Administrator',
                't.subheading.administrator':
                  'With great power comes great configuration',
              },
            },
          })
        ),
      ],
    });

    // Act
    const fixture = TestBed.createComponent(HostWithSubtitle);
    await fixture.whenStable();

    // Assert
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1')).toHaveLength(1);
    expect(element.querySelector('hgroup h1')?.textContent?.trim()).toBe(
      'Administrator'
    );
    expect(element.querySelector('hgroup p')?.textContent?.trim()).toBe(
      'With great power comes great configuration'
    );
  });
});
