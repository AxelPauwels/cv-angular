import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { SectionHeading } from './section-heading';

@Component({
  imports: [SectionHeading],
  template: `
    <section aria-labelledby="about-title">
      <ds-section-heading
        headingId="about-title"
        title="t.subheading.about"
        tagline="t.subheading.about.description" />
    </section>
    <section aria-labelledby="hobbies-title">
      <ds-section-heading
        headingId="hobbies-title"
        title="t.subheading.hobbies" />
    </section>
  `,
})
class Host {}

describe('SectionHeading', () => {
  it('renders the translated title as an <h2> that names its section, with an optional tagline', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                't.subheading.about': 'About me',
                't.subheading.about.description': 'The human behind the code',
                't.subheading.hobbies': 'Hobbies',
              },
            },
          })
        ),
      ],
    });

    // Act
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const [about, hobbies] = Array.from(element.querySelectorAll('section'));
    const aboutHeading = about.querySelector(
      `hgroup > h2#${about.getAttribute('aria-labelledby')}`
    );
    expect(aboutHeading?.textContent?.trim()).toBe('About me');
    expect(about.querySelector('hgroup > p')?.textContent?.trim()).toBe(
      'The human behind the code'
    );

    expect(
      hobbies.querySelector(`h2#${hobbies.getAttribute('aria-labelledby')}`)
        ?.textContent
    ).toContain('Hobbies');
    expect(hobbies.querySelector('hgroup > p')).toBeNull();
  });
});
