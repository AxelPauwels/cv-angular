import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { DownloadMenu } from './download-menu';

describe('DownloadMenu', () => {
  async function render(labelKey = 't.common.download-cv') {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                t: {
                  common: { 'download-cv': 'Download CV', pdf: 'PDF' },
                  language: { english: 'English', dutch: 'Dutch' },
                },
              },
            },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(DownloadMenu);
    fixture.componentRef.setInput('options', [
      {
        href: '/assets/documents/cv-en.pdf',
        fileName: 'cv-en.pdf',
        labelKey: 't.language.english',
        lang: 'en',
      },
      {
        href: '/assets/documents/cv-nl.pdf',
        fileName: 'cv-nl.pdf',
        labelKey: 't.language.dutch',
        lang: 'nl',
      },
    ]);
    fixture.componentRef.setInput('labelKey', labelKey);
    fixture.componentRef.setInput('hintKey', 't.common.pdf');
    await fixture.whenStable();
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    return { fixture, trigger };
  }

  it('is a menu button named by its label and the visible hint', async () => {
    // Arrange
    const labelKey = 't.common.download-cv';

    // Act
    const { trigger } = await render(labelKey);

    // Assert
    // the icon is hidden, so the name is the label plus the visible "PDF"
    expect(
      trigger
        .querySelector('.cdk-visually-hidden')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim()
    ).toBe('Download CV');
    expect(trigger.querySelector('.download-menu__label')?.textContent).toBe(
      'PDF'
    );
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('lists every version as a real download link', async () => {
    // Arrange
    const { fixture, trigger } = await render();
    trigger.click();

    // Act
    await fixture.whenStable();

    // Assert
    // The menu renders in an overlay outside the component, hence `document`
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a.download-menu__option')
    );
    expect(
      links.map((link) => link.textContent?.replace(/\s+/g, ' ').trim())
    ).toEqual(['picture_as_pdf English (PDF)', 'picture_as_pdf Dutch (PDF)']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/assets/documents/cv-en.pdf',
      '/assets/documents/cv-nl.pdf',
    ]);
    expect(links.map((link) => link.getAttribute('download'))).toEqual([
      'cv-en.pdf',
      'cv-nl.pdf',
    ]);
    expect(links.map((link) => link.getAttribute('hreflang'))).toEqual([
      'en',
      'nl',
    ]);
  });
});
