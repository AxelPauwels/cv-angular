import { TestBed } from '@angular/core/testing';
import { FeatureToggleService } from './feature-toggle.service';

describe('FeatureToggleService', () => {
  beforeEach(() => localStorage.clear());

  it('starts with every toggle at its default: everything on', () => {
    // Arrange & Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.toggles.map((toggle) => toggle.id)).toContain('tour-button');
    expect(Object.values(service.states()).every(Boolean)).toBe(true);
  });

  it('switches a toggle and remembers only what differs from the default', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    const tourButton = service.isEnabled('tour-button');

    // Act
    service.change('tour-button', false);

    // Assert
    expect(tourButton()).toBe(false);
    expect(
      JSON.parse(localStorage.getItem('cv-feature-toggles') ?? '')
    ).toEqual({ 'tour-button': false });

    // Act
    service.change('tour-button', true);

    // Assert
    expect(tourButton()).toBe(true);
    expect(localStorage.getItem('cv-feature-toggles')).toBeNull();
  });

  it('restores a saved choice and ignores unknown or invalid values', () => {
    // Arrange
    localStorage.setItem(
      'cv-feature-toggles',
      JSON.stringify({ 'tour-button': false, unknown: true, other: 'yes' })
    );

    // Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.states()['tour-button']).toBe(false);
    expect(service.states()).not.toHaveProperty('unknown');
    expect(service.states()).not.toHaveProperty('other');
  });

  it('switches a main menu item off with its last sub menu item', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);

    // Act
    service.change('showcase-micro-frontends', false);

    // Assert
    expect(service.isEnabled('main-menu-showcase')()).toBe(false);

    // Act: the first sub menu item back on brings the main item back
    service.change('showcase-micro-frontends', true);

    // Assert
    expect(service.isEnabled('main-menu-showcase')()).toBe(true);
  });

  it('keeps a main menu item on while one of its sub menu items is on', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    const technical = [
      'technical-architecture',
      'technical-project-graph',
      'technical-graphql-docs',
      'technical-code-coverage',
      'technical-end-to-end-tests',
    ] as const;

    // Act
    technical.forEach((id) => service.change(id, false));

    // Assert
    expect(service.isEnabled('main-menu-technical')()).toBe(true);

    // Act
    service.change('technical-versions', false);

    // Assert
    expect(service.isEnabled('main-menu-technical')()).toBe(false);
  });

  it('switches every sub menu item on with a main item that had none', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    service.change('showcase-micro-frontends', false);

    // Act
    service.change('main-menu-showcase', true);

    // Assert
    expect(service.isEnabled('showcase-micro-frontends')()).toBe(true);
  });

  it('leaves a main menu item switched off on purpose off', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    service.change('main-menu-technical', false);

    // Act
    service.change('technical-versions', false);
    service.change('technical-versions', true);

    // Assert
    expect(service.isEnabled('main-menu-technical')()).toBe(false);
  });

  it('switches a saved main menu item without sub menu items off', () => {
    // Arrange
    localStorage.setItem(
      'cv-feature-toggles',
      JSON.stringify({ 'showcase-micro-frontends': false })
    );

    // Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.isEnabled('main-menu-showcase')()).toBe(false);
  });

  it('falls back to the defaults when the saved value is corrupt', () => {
    // Arrange
    localStorage.setItem('cv-feature-toggles', '{not json');

    // Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.isEnabled('tour-button')()).toBe(true);
  });

  it('resets every toggle and forgets the choices', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    service.change('tour-button', false);

    // Act
    service.reset();

    // Assert
    expect(service.isEnabled('tour-button')()).toBe(true);
    expect(localStorage.getItem('cv-feature-toggles')).toBeNull();
  });
});
