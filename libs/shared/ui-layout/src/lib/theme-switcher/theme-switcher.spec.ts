import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee, TranslateService } from '@tolgee/ngx';
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
                    gold: 'Gold',
                    graphite: 'Graphite',
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
      { id: 'gold', labelKey: 't.theme.gold' },
      { id: 'graphite', labelKey: 't.theme.graphite' },
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
    // Arrange
    const theme = 'gold';

    // Act
    const { trigger } = await render(theme);

    // Assert
    expect(trigger.getAttribute('aria-label')).toBe('Color theme');
  });

  it('lists the themes as color dots and marks the active one', async () => {
    // Arrange
    const { fixture, trigger } = await render('graphite');

    // Act
    const items = await openMenu(fixture, trigger);
    const swatches = items.map((item) =>
      item.querySelector('.theme-switcher__swatch')
    );

    // Assert
    expect(
      items.map((item) =>
        item.querySelector('.theme-switcher__label')?.textContent?.trim()
      )
    ).toEqual(['Gold', 'Graphite']);
    expect(
      swatches.map((swatch) => swatch?.getAttribute('data-theme'))
    ).toEqual(['gold', 'graphite']);
    expect(
      swatches.map((swatch) =>
        swatch?.classList.contains('theme-switcher__swatch--checked')
      )
    ).toEqual([false, true]);
    expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
    ]);
  });

  async function renderGrouped() {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                t: {
                  theme: { gold: 'Gold', graphite: 'Graphite', ocean: 'Ocean' },
                },
              },
              nl: {
                t: {
                  theme: { gold: 'Goud', graphite: 'Grafiet', ocean: 'Oceaan' },
                },
              },
            },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(ThemeSwitcher);
    fixture.componentRef.setInput('themes', [
      { id: 'ocean', labelKey: 't.theme.ocean', group: 'color' },
      { id: 'graphite', labelKey: 't.theme.graphite', group: 'color' },
      { id: 'gold', labelKey: 't.theme.gold', group: 'metal' },
    ]);
    fixture.componentRef.setInput('theme', 'gold');
    await fixture.whenStable();
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const labels = (items: HTMLButtonElement[]) =>
      items.map((item) =>
        item.querySelector('.theme-switcher__label')?.textContent?.trim()
      );
    return { fixture, trigger, labels };
  }

  it('keeps the given order with a divider between groups', async () => {
    // Arrange
    const { fixture, trigger, labels } = await renderGrouped();

    // Act
    const items = await openMenu(fixture, trigger);

    // Assert
    expect(labels(items)).toEqual(['Ocean', 'Graphite', 'Gold']);
    // One divider between the groups, one above "reset"
    expect(items[2].previousElementSibling?.tagName).toBe('MAT-DIVIDER');
    expect(items[1].previousElementSibling?.tagName).not.toBe('MAT-DIVIDER');
    expect(
      document.querySelectorAll('.theme-switcher__menu mat-divider')
    ).toHaveLength(2);
  });

  it('translates the themes again after a language change', async () => {
    // Arrange
    const { fixture, trigger, labels } = await renderGrouped();
    await openMenu(fixture, trigger);

    // Act
    await TestBed.inject(TranslateService).changeLanguage('nl');
    await fixture.whenStable();

    // Assert
    expect(
      labels(
        Array.from(
          document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
        )
      )
    ).toEqual(['Oceaan', 'Grafiet', 'Goud']);
  });

  it('emits the chosen theme', async () => {
    // Arrange
    const { fixture, trigger } = await render('gold');
    const chosen: string[] = [];
    fixture.componentInstance.themeChange.subscribe((id) => chosen.push(id));

    // Act
    const items = await openMenu(fixture, trigger);
    items[1].click();

    // Assert
    expect(chosen).toEqual(['graphite']);
  });

  it('emits a reset from the last menu item', async () => {
    // Arrange
    const { fixture, trigger } = await render('gold');
    let resets = 0;
    fixture.componentInstance.themeReset.subscribe(() => resets++);

    // Act
    await openMenu(fixture, trigger);
    document
      .querySelector<HTMLButtonElement>('.theme-switcher__reset')
      ?.click();

    // Assert
    expect(resets).toBe(1);
  });
});
