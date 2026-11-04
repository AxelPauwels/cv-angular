import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  async function render(language: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                t: {
                  language: {
                    english: 'English',
                    dutch: 'Dutch',
                    switch: 'Language',
                  },
                },
              },
            },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(LanguageSwitcher);
    fixture.componentRef.setInput('languages', [
      { code: 'en', labelKey: 't.language.english' },
      { code: 'nl', labelKey: 't.language.dutch' },
    ]);
    fixture.componentRef.setInput('language', language);
    await fixture.whenStable();
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    return { fixture, trigger };
  }

  /** The menu renders in an overlay outside the component, hence `document` */
  async function openMenu(
    fixture: { whenStable(): Promise<unknown> },
    trigger: HTMLButtonElement
  ) {
    trigger.click();
    await fixture.whenStable();
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
    );
  }

  it('is a labelled icon menu button without the language code', async () => {
    const { trigger } = await render('nl');

    expect(trigger.getAttribute('aria-label')).toBe('Language');
    expect(trigger.textContent).not.toContain('NL');
  });

  it('lists the full language names and checks the active one', async () => {
    const { fixture, trigger } = await render('nl');
    const items = await openMenu(fixture, trigger);

    expect(
      items.map((item) => item.textContent?.replace('check', '').trim())
    ).toEqual(['English', 'Dutch']);
    expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
    ]);
  });

  it('emits the chosen language', async () => {
    const { fixture, trigger } = await render('en');
    const chosen: string[] = [];
    fixture.componentInstance.languageChange.subscribe((code) =>
      chosen.push(code)
    );

    const items = await openMenu(fixture, trigger);
    items[1].click();

    expect(chosen).toEqual(['nl']);
  });
});
