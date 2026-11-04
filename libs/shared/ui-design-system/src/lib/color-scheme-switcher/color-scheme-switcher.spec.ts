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
            staticData: { en: { t: { theme: { 'dark-mode': 'Dark mode' } } } },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(ColorSchemeSwitcher);
    fixture.componentRef.setInput('colorScheme', colorScheme);
    await fixture.whenStable();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    return { fixture, button };
  }

  it('is a labelled toggle button pressed in dark mode', async () => {
    const { button } = await render('dark');

    expect(button.getAttribute('aria-label')).toBe('Dark mode');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent?.trim()).toBe('light_mode');
  });

  it('emits the other mode on click', async () => {
    const { fixture, button } = await render('light');
    const chosen: ColorSchemeOption[] = [];
    fixture.componentInstance.colorSchemeChange.subscribe((scheme) =>
      chosen.push(scheme)
    );

    button.click();

    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(chosen).toEqual(['dark']);
  });
});
