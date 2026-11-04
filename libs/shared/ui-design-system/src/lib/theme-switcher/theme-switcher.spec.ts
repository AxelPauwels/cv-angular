import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwitcher', () => {
  async function render(theme: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                t: {
                  theme: {
                    switch: 'Color theme',
                    violet: 'Violet',
                    rose: 'Rose',
                  },
                },
              },
            },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(ThemeSwitcher);
    fixture.componentRef.setInput('themes', [
      { id: 'violet', labelKey: 't.theme.violet' },
      { id: 'rose', labelKey: 't.theme.rose' },
    ]);
    fixture.componentRef.setInput('theme', theme);
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

  it('is a labelled menu button', async () => {
    const { trigger } = await render('violet');

    expect(trigger.getAttribute('aria-label')).toBe('Color theme');
  });

  it('lists the themes as radios in their own color and checks the active one', async () => {
    const { fixture, trigger } = await render('rose');
    const items = await openMenu(fixture, trigger);
    const radios = items.map((item) =>
      item.querySelector('.theme-switcher-radio')
    );

    expect(
      items.map((item) => item.querySelector('span')?.textContent?.trim())
    ).toEqual(['Violet', 'Rose']);
    expect(radios.map((radio) => radio?.getAttribute('data-theme'))).toEqual([
      'violet',
      'rose',
    ]);
    expect(radios.map((radio) => radio?.textContent?.trim())).toEqual([
      'radio_button_unchecked',
      'radio_button_checked',
    ]);
    expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
    ]);
  });

  it('emits the chosen theme', async () => {
    const { fixture, trigger } = await render('violet');
    const chosen: string[] = [];
    fixture.componentInstance.themeChange.subscribe((id) => chosen.push(id));

    const items = await openMenu(fixture, trigger);
    items[1].click();

    expect(chosen).toEqual(['rose']);
  });
});
