import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import {
  ColorSchemeOption,
  ColorSchemeSwitcher,
} from './color-scheme-switcher';

describe('ColorSchemeSwitcher', () => {
  async function render(colorScheme: ColorSchemeOption) {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                t: {
                  common: { reset: 'Reset to default' },
                  'color-scheme': { light: 'Light mode', dark: 'Dark mode' },
                },
              },
            },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(ColorSchemeSwitcher);
    fixture.componentRef.setInput('colorScheme', colorScheme);
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

  it('is a labelled menu button showing the current mode', async () => {
    // Arrange & Act
    const { trigger } = await render('dark');

    // Assert
    expect(trigger.getAttribute('aria-label')).toBe('Dark mode');
    expect(trigger.textContent?.trim()).toBe('dark_mode');
  });

  it('names the light mode when it is active', async () => {
    // Arrange & Act
    const { trigger } = await render('light');

    // Assert
    expect(trigger.getAttribute('aria-label')).toBe('Light mode');
    expect(trigger.textContent?.trim()).toBe('light_mode');
  });

  it('lists light and dark and marks the current mode', async () => {
    // Arrange & Act
    const { fixture, trigger } = await render('dark');
    const items = await openMenu(fixture, trigger);

    // Assert
    expect(
      items.map((item) => item.querySelector('span')?.textContent?.trim())
    ).toEqual(['Light mode', 'Dark mode']);
    expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
    ]);
  });

  it('emits the chosen mode, or a reset', async () => {
    // Arrange
    const { fixture, trigger } = await render('light');
    const chosen: ColorSchemeOption[] = [];
    let resets = 0;
    fixture.componentInstance.colorSchemeChange.subscribe((scheme) =>
      chosen.push(scheme)
    );
    fixture.componentInstance.colorSchemeReset.subscribe(() => resets++);

    // Act
    (await openMenu(fixture, trigger))[1].click();
    await openMenu(fixture, trigger);
    document
      .querySelector<HTMLButtonElement>('.color-scheme-switcher__reset')
      ?.click();

    // Assert
    expect(chosen).toEqual(['dark']);
    expect(resets).toBe(1);
  });
});
