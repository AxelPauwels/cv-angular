import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  defaultFeatureToggleStates,
  FeatureToggleService,
  saveFeatureTogglesForTesting,
} from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { FeatureToggles } from './feature-toggles';

describe('FeatureToggles', () => {
  beforeEach(() => {
    localStorage.clear();
    // every toggle on, whatever the defaults
    saveFeatureTogglesForTesting();
  });
  afterEach(() => TestBed.inject(MatSnackBar).dismiss());

  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: FeatureToggles }]),
        provideI18nTesting(),
      ],
    });
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;
    const toggle = (id = 'tour-button') =>
      element.querySelector<HTMLButtonElement>(
        `mat-slide-toggle[data-toggle="${id}"] button`
      );
    return { harness, element, toggle };
  }

  it('lists the feature toggles as switches', async () => {
    // Arrange
    const page = render;

    // Act
    const { element, toggle } = await page();

    // Assert
    expect(element.querySelector('h1')?.textContent).toContain(
      'Feature toggles'
    );
    expect(toggle()?.closest('mat-slide-toggle')?.textContent).toContain(
      'Tour button'
    );
    expect(toggle()?.getAttribute('role')).toBe('switch');
    expect(toggle()?.getAttribute('aria-checked')).toBe('true');
    expect(element.textContent).not.toContain('t.');
  });

  it('switches the tour button off', async () => {
    // Arrange
    const { harness, toggle } = await render();
    const service = TestBed.inject(FeatureToggleService);

    // Act
    toggle()?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(service.isEnabled('tour-button')()).toBe(false);
    expect(toggle()?.getAttribute('aria-checked')).toBe('false');
  });

  it('resets every toggle to its default', async () => {
    // Arrange
    const { harness, element, toggle } = await render();
    const service = TestBed.inject(FeatureToggleService);
    const byDefault = defaultFeatureToggleStates()['tour-button'];

    // Act
    element.querySelector<HTMLButtonElement>('button[matButton]')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(service.isEnabled('tour-button')()).toBe(byDefault);
    expect(toggle()?.getAttribute('aria-checked')).toBe(String(byDefault));
  });

  it('shows a card per section, with one per sub menu', async () => {
    // Arrange
    const page = render;

    // Act
    const { element } = await page();

    // Assert
    expect(
      Array.from(element.querySelectorAll('h2 > span:first-child')).map((h) =>
        h.textContent?.replace(/\s+/g, ' ').trim()
      )
    ).toEqual([
      'Navbar icons',
      'General',
      'Main menu',
      'Submenu CV',
      'Submenu Technical',
      'Submenu Showcase',
    ]);
    expect(element.querySelectorAll('mat-card')).toHaveLength(6);
    expect(element.querySelectorAll('mat-slide-toggle')).toHaveLength(23);
  });

  it('switches the main menu item off with its last sub menu item, and says so', async () => {
    // Arrange
    const { harness, element, toggle } = await render();
    TestBed.inject(FeatureToggleService).change(
      'showcase-feature-toggles',
      false
    );
    TestBed.inject(FeatureToggleService).change('showcase-lighthouse', false);
    TestBed.inject(MatSnackBar).dismiss();
    await harness.fixture.whenStable();

    // Act
    toggle('showcase-micro-frontends')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(toggle('main-menu-showcase')?.getAttribute('aria-checked')).toBe(
      'false'
    );
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Showcase switched off too.'
    );
  });

  it('switches the main menu item back on with its first sub menu item, and says so', async () => {
    // Arrange
    const { harness, element, toggle } = await render();
    const service = TestBed.inject(FeatureToggleService);
    service.change('showcase-feature-toggles', false);
    service.change('showcase-lighthouse', false);
    service.change('showcase-micro-frontends', false);
    TestBed.inject(MatSnackBar).dismiss();
    await harness.fixture.whenStable();

    // Act
    toggle('showcase-micro-frontends')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(toggle('main-menu-showcase')?.getAttribute('aria-checked')).toBe(
      'true'
    );
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Showcase switched on too.'
    );
  });

  it('announces nothing when a change switches nothing along', async () => {
    // Arrange
    const { harness, element, toggle } = await render();

    // Act
    toggle()?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      ''
    );
  });

  it('clears the announcement on reset', async () => {
    // Arrange
    const { harness, element, toggle } = await render();
    const service = TestBed.inject(FeatureToggleService);
    service.change('showcase-feature-toggles', false);
    service.change('showcase-lighthouse', false);
    TestBed.inject(MatSnackBar).dismiss();
    toggle('showcase-micro-frontends')?.click();
    await harness.fixture.whenStable();

    // Act
    element.querySelector<HTMLButtonElement>('button[matButton]')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      ''
    );
  });

  it('counts the switches that are on per card', async () => {
    // Arrange
    const { harness, element } = await render();
    // the navbar icons: several switches, none linked to another
    const card = element.querySelector('ds-card') as HTMLElement;
    // the numbers only: the wording is the translator's
    const count = () =>
      card.querySelector('.feature-toggles__tag')?.textContent?.match(/\d+/g);
    const total = card.querySelectorAll('mat-slide-toggle').length;

    // Act
    const before = count();
    card.querySelector<HTMLButtonElement>('mat-slide-toggle button')?.click();
    await harness.fixture.whenStable();
    const after = count();

    // Assert
    expect(total).toBeGreaterThan(1);
    expect(before).toEqual([String(total), String(total)]);
    expect(after).toEqual([String(total - 1), String(total)]);
  });

  it('names every card as a region, by its title', async () => {
    // Arrange
    const page = render;

    // Act
    const { element } = await page();

    // Assert
    const regions = Array.from(element.querySelectorAll('ds-card'));
    expect(regions.map((region) => region.getAttribute('role'))).toEqual(
      Array(6).fill('region')
    );
    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual([
      'Navbar icons',
      'General',
      'Main menu',
      'Submenu CV',
      'Submenu Technical',
      'Submenu Showcase',
    ]);
  });

  it('says how to get back here when its own menu item is switched off', async () => {
    // Arrange
    const { harness, toggle } = await render();

    // Act
    toggle('showcase-feature-toggles')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(
      TestBed.inject(FeatureToggleService).isEnabled(
        'showcase-feature-toggles'
      )()
    ).toBe(false);
    const snackBar = document.querySelector('mat-snack-bar-container');
    expect(snackBar?.textContent).toContain('Axel Pauwels');
    expect(snackBar?.textContent).toContain('/showcase/feature-toggles');
  });

  it('keeps that message until "OK" closes it', async () => {
    // Arrange
    const { harness, toggle } = await render();
    toggle('showcase-feature-toggles')?.click();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const ok = document.querySelector<HTMLButtonElement>(
      'mat-snack-bar-container button'
    );

    // Act
    ok?.click();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Assert
    expect(ok?.textContent?.trim()).toBe('OK');
    expect(document.querySelector('mat-snack-bar-container')).toBeNull();
  });

  it('shows no message when switching another item off', async () => {
    // Arrange
    const { harness, toggle } = await render();

    // Act
    toggle()?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(document.querySelector('mat-snack-bar-container')).toBeNull();
  });

  it('shows no message when switching its own menu item back on', async () => {
    // Arrange
    const { harness, toggle } = await render();
    TestBed.inject(FeatureToggleService).change(
      'showcase-feature-toggles',
      false
    );
    await harness.fixture.whenStable();

    // Act
    toggle('showcase-feature-toggles')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(
      TestBed.inject(FeatureToggleService).isEnabled(
        'showcase-feature-toggles'
      )()
    ).toBe(true);
    expect(document.querySelector('mat-snack-bar-container')).toBeNull();
  });
});
