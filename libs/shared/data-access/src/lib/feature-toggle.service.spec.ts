import { TestBed } from '@angular/core/testing';
import { FEATURE_TOGGLE_DEFAULTS } from './feature-toggle-defaults';
import { FeatureToggleService } from './feature-toggle.service';
import { saveFeatureTogglesForTesting } from './feature-toggle-testing';
import {
  defaultFeatureToggleStates,
  withConsistentMenuItems,
} from './feature-toggles';

const STORAGE_KEY = 'cv-feature-toggles';

function savedToggles(): Record<string, boolean> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
}

describe('FeatureToggleService', () => {
  beforeEach(() => localStorage.clear());

  it('starts with every toggle at its default', () => {
    // Arrange
    const expected = withConsistentMenuItems(defaultFeatureToggleStates());

    // Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.toggles.map((toggle) => toggle.id)).toContain('tour-button');
    expect(service.states()).toEqual(expected);
  });

  it('switches a toggle and remembers only what differs from the default', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    const tourButton = service.isEnabled('tour-button');
    const byDefault = FEATURE_TOGGLE_DEFAULTS['tour-button'];

    // Act
    service.change('tour-button', !byDefault);

    // Assert
    expect(tourButton()).toBe(!byDefault);
    expect(savedToggles()).toHaveProperty('tour-button', !byDefault);
  });

  it('forgets a toggle switched back to its default', () => {
    // Arrange
    const service = TestBed.inject(FeatureToggleService);
    const tourButton = service.isEnabled('tour-button');
    const byDefault = FEATURE_TOGGLE_DEFAULTS['tour-button'];
    service.change('tour-button', !byDefault);

    // Act
    service.change('tour-button', byDefault);

    // Assert
    expect(tourButton()).toBe(byDefault);
    expect(savedToggles()).not.toHaveProperty('tour-button');
  });

  it('restores a saved choice and ignores unknown or invalid values', () => {
    // Arrange
    localStorage.setItem(
      STORAGE_KEY,
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
    saveFeatureTogglesForTesting();
    const service = TestBed.inject(FeatureToggleService);
    service.change('showcase-admin', false);

    // Act
    service.change('showcase-micro-frontends', false);

    // Assert
    expect(service.isEnabled('main-menu-showcase')()).toBe(false);
  });

  it('switches a main menu item back on with its first sub menu item', () => {
    // Arrange
    saveFeatureTogglesForTesting();
    const service = TestBed.inject(FeatureToggleService);
    service.change('showcase-admin', false);
    service.change('showcase-micro-frontends', false);

    // Act
    service.change('showcase-micro-frontends', true);

    // Assert
    expect(service.isEnabled('main-menu-showcase')()).toBe(true);
  });

  it('keeps a main menu item on while one of its sub menu items is on', () => {
    // Arrange
    saveFeatureTogglesForTesting();
    const service = TestBed.inject(FeatureToggleService);
    const allButVersions = [
      'technical-architecture',
      'technical-project-graph',
      'technical-graphql-docs',
      'technical-code-coverage',
      'technical-end-to-end-tests',
    ] as const;

    // Act
    allButVersions.forEach((id) => service.change(id, false));

    // Assert
    expect(service.isEnabled('main-menu-technical')()).toBe(true);
    expect(service.isEnabled('technical-versions')()).toBe(true);
  });

  it('switches every sub menu item on with a main item that had none', () => {
    // Arrange
    saveFeatureTogglesForTesting();
    const service = TestBed.inject(FeatureToggleService);
    service.change('showcase-micro-frontends', false);
    service.change('showcase-admin', false);

    // Act
    service.change('main-menu-showcase', true);

    // Assert
    expect(service.isEnabled('showcase-micro-frontends')()).toBe(true);
    expect(service.isEnabled('showcase-admin')()).toBe(true);
  });

  it('leaves a main menu item switched off on purpose off', () => {
    // Arrange
    saveFeatureTogglesForTesting();
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
      STORAGE_KEY,
      JSON.stringify({
        'main-menu-showcase': true,
        'showcase-micro-frontends': false,
        'showcase-admin': false,
      })
    );

    // Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.isEnabled('main-menu-showcase')()).toBe(false);
  });

  it('falls back to the defaults when the saved value is corrupt', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, '{not json');

    // Act
    const service = TestBed.inject(FeatureToggleService);

    // Assert
    expect(service.states()).toEqual(
      withConsistentMenuItems(defaultFeatureToggleStates())
    );
  });

  it('resets every toggle and forgets the choices', () => {
    // Arrange
    saveFeatureTogglesForTesting();
    const service = TestBed.inject(FeatureToggleService);

    // Act
    service.reset();

    // Assert
    expect(service.states()).toEqual(
      withConsistentMenuItems(defaultFeatureToggleStates())
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
