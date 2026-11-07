import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingHarness } from '@angular/router/testing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { FeatureToggles } from './feature-toggles';

describe('FeatureToggles', () => {
  beforeEach(() => localStorage.clear());
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
    const toggle = () =>
      element.querySelector<HTMLButtonElement>(
        'mat-slide-toggle[data-toggle="tour-button"] button'
      );
    return { harness, element, toggle };
  }

  it('lists the feature toggles with a described switch', async () => {
    // Arrange & Act
    const { element, toggle } = await render();

    // Assert
    expect(element.querySelector('h1')?.textContent).toContain('Administrator');
    expect(element.querySelector('hgroup p')?.textContent).toContain(
      'With great power comes great configuration'
    );
    expect(toggle()?.closest('mat-slide-toggle')?.textContent).toContain(
      'Tour button'
    );
    expect(toggle()?.getAttribute('role')).toBe('switch');
    expect(toggle()?.getAttribute('aria-checked')).toBe('true');
    const description = element.querySelector(
      `#${toggle()?.getAttribute('aria-describedby')}`
    );
    expect(description?.textContent).toContain('home page');
    expect(element.textContent).not.toContain('t.');
  });

  it('switches the tour button off and back on with the reset', async () => {
    // Arrange
    const { harness, element, toggle } = await render();
    const service = TestBed.inject(FeatureToggleService);

    // Act
    toggle()?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(service.isEnabled('tour-button')()).toBe(false);
    expect(toggle()?.getAttribute('aria-checked')).toBe('false');

    // Act
    element.querySelector<HTMLButtonElement>('button[matButton]')?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(service.isEnabled('tour-button')()).toBe(true);
    expect(toggle()?.getAttribute('aria-checked')).toBe('true');
  });

  it('shows a card per section, with one per sub menu', async () => {
    // Arrange & Act
    const { element } = await render();

    // Assert
    expect(
      Array.from(element.querySelectorAll('h2')).map((h) =>
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
    expect(element.querySelectorAll('mat-slide-toggle')).toHaveLength(22);
  });

  it('describes the sub menu toggles by the shared submenu text', async () => {
    // Arrange & Act
    const { element } = await render();
    const toggle = element.querySelector(
      'mat-slide-toggle[data-toggle="technical-versions"] button'
    );

    // Assert
    const description = element.querySelector(
      `#${toggle?.getAttribute('aria-describedby')}`
    );
    expect(description?.textContent).toContain('submenu');
  });

  it('switches the main menu item off with its last sub menu item, and says so', async () => {
    // Arrange
    const { harness, element } = await render();
    const toggle = (id: string) =>
      element.querySelector<HTMLButtonElement>(
        `mat-slide-toggle[data-toggle="${id}"] button`
      );

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
    const description = element.querySelector(
      `#${toggle('main-menu-showcase')?.getAttribute('aria-describedby')}`
    );
    expect(description?.textContent).toContain('submenu');
  });

  it('says how to get back here when its own menu item is switched off', async () => {
    // Arrange: on, whatever the defaults
    const { harness } = await render();
    TestBed.inject(FeatureToggleService).change('showcase-admin', true);
    await harness.fixture.whenStable();
    const toggle = () =>
      document.querySelector<HTMLButtonElement>(
        'mat-slide-toggle[data-toggle="showcase-admin"] button'
      );

    // Act
    toggle()?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(
      TestBed.inject(FeatureToggleService).isEnabled('showcase-admin')()
    ).toBe(false);
    const snackBar = document.querySelector('mat-snack-bar-container');
    expect(snackBar?.textContent).toContain('Axel Pauwels');
    expect(snackBar?.textContent).toContain('/showcase/admin');

    // Act: it stays until "OK" closes it
    await new Promise((resolve) => setTimeout(resolve, 100));
    const ok = snackBar?.querySelector<HTMLButtonElement>('button');
    expect(ok?.textContent?.trim()).toBe('OK');
    ok?.click();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Assert
    expect(document.querySelector('mat-snack-bar-container')).toBeNull();
  });

  it('shows no message when switching another item off', async () => {
    // Arrange: on, whatever the defaults
    const { harness, toggle } = await render();
    TestBed.inject(FeatureToggleService).change('tour-button', true);
    await harness.fixture.whenStable();

    // Act
    toggle()?.click();
    await harness.fixture.whenStable();

    // Assert
    expect(document.querySelector('mat-snack-bar-container')).toBeNull();
  });
});
