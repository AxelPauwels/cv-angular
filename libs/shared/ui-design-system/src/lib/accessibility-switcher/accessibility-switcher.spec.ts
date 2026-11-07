import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import {
  AccessibilityOptions,
  AccessibilitySwitcher,
} from './accessibility-switcher';

describe('AccessibilitySwitcher', () => {
  const defaults: AccessibilityOptions = {
    textSize: 100,
    reduceMotion: false,
    highContrast: false,
    wideTextSpacing: false,
  };

  async function render(settings: Partial<AccessibilityOptions> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                t: {
                  accessibility: {
                    switch: 'Accessibility',
                    title: 'Accessibility settings',
                    'text-size': 'Text size',
                    'reduce-motion': 'Reduce motion',
                    'high-contrast': 'Higher contrast',
                    'text-spacing': 'Wider text spacing',
                  },
                  common: { reset: 'Reset' },
                },
              },
            },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(AccessibilitySwitcher);
    fixture.componentRef.setInput('textSizes', [100, 125, 150]);
    fixture.componentRef.setInput('settings', { ...defaults, ...settings });
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const trigger = host.querySelector<HTMLButtonElement>(
      '.accessibility-switcher__trigger'
    );
    const panel = host.querySelector<HTMLElement>('[popover]');
    if (!trigger || !panel) {
      throw new Error('trigger or panel missing');
    }
    const changes: Partial<AccessibilityOptions>[] = [];
    fixture.componentInstance.settingsChange.subscribe((change) =>
      changes.push(change)
    );
    return { fixture, host, trigger, panel, changes };
  }

  it('is a labelled button that opens and closes a labelled dialog', async () => {
    // Arrange & Act
    const { trigger, panel } = await render();

    // Assert
    expect(trigger.getAttribute('aria-label')).toBe('Accessibility');
    expect(panel.matches(':popover-open')).toBe(false);

    // Act
    trigger.click();

    // Assert
    expect(panel.matches(':popover-open')).toBe(true);
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-label')).toBe('Accessibility settings');

    // Act
    // no close button: the popover closes on Escape, a click outside or the trigger
    trigger.click();

    // Assert
    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('offers the text sizes as a labelled radio group with the active one checked', async () => {
    // Arrange & Act
    const { host } = await render({ textSize: 125 });
    const group = host.querySelector('[role="radiogroup"]');
    const radios = Array.from(host.querySelectorAll('[role="radio"]'));

    // Assert
    expect(
      host
        .querySelector(`#${group?.getAttribute('aria-labelledby')}`)
        ?.textContent?.trim()
    ).toBe('Text size');
    expect(radios.map((radio) => radio.textContent?.trim())).toEqual([
      '100%',
      '125%',
      '150%',
    ]);
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
    ]);
  });

  it('emits the chosen text size', async () => {
    // Arrange
    const { fixture, host, changes } = await render();

    // Act
    host.querySelectorAll<HTMLButtonElement>('[role="radio"]')[2].click();
    await fixture.whenStable();

    // Assert
    expect(changes).toEqual([{ textSize: 150 }]);
  });

  it('shows the switches in their state and emits a flipped one', async () => {
    // Arrange & Act
    const { fixture, host, changes } = await render({ highContrast: true });
    const switches = Array.from(
      host.querySelectorAll<HTMLButtonElement>('[role="switch"]')
    );

    // Assert
    expect(switches.map((item) => item.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
    ]);

    // Act
    switches[0].click();
    switches[2].click();
    await fixture.whenStable();

    // Assert
    expect(changes).toEqual([
      { reduceMotion: true },
      { wideTextSpacing: true },
    ]);
  });

  it('emits a reset', async () => {
    // Arrange & Act
    const { fixture, host } = await render();
    let resets = 0;
    fixture.componentInstance.resetSettings.subscribe(() => resets++);

    // Assert
    const reset = host.querySelector<HTMLButtonElement>(
      '.accessibility-switcher__reset'
    );
    expect(reset?.textContent?.trim()).toBe('restart_altReset');

    // Act
    reset?.click();

    // Assert
    expect(resets).toBe(1);
  });
});
