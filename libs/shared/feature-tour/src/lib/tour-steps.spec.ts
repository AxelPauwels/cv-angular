import { ROUTES } from '@cv/shared-util-routing';
import { DEFAULT_TOUR_STEPS } from './tour-steps';

describe('DEFAULT_TOUR_STEPS', () => {
  it('starts on the home page and visits every main menu item in menu order', () => {
    // Arrange
    const steps = DEFAULT_TOUR_STEPS;

    // Act
    const ids = steps.map(({ id }) => id);

    // Assert
    expect(ids).toEqual([
      'download-cv',
      'settings',
      'home',
      'cv',
      'technical',
      'showcase',
      'contact',
      'finish',
    ]);
    expect(steps[0].route).toBe(ROUTES.HOME.ROOT_ROUTER_LINK);
    expect(steps.at(-1)?.route).toBe(ROUTES.HOME.ROOT_ROUTER_LINK);
  });

  it('points at the home tab, or at home in the phone menu', () => {
    // Arrange
    const id = 'home';

    // Act
    const step = DEFAULT_TOUR_STEPS.find((s) => s.id === id);

    // Assert
    expect(step).toEqual(
      expect.objectContaining({
        route: ROUTES.HOME.ROOT_ROUTER_LINK,
        target: '[data-tour="menu-home"]',
        menuTarget: '[data-tour="menu-panel"] [data-tour="menu-home"]',
        labelKey: 't.tour.step.home.label',
      })
    );
    // home is always in the menu: no toggle can skip it
    expect(step?.toggles).toBeUndefined();
  });

  it('skips the cv step when the cv main menu item is switched off', () => {
    // Arrange
    const id = 'cv';

    // Act
    const step = DEFAULT_TOUR_STEPS.find((s) => s.id === id);

    // Assert
    expect(step?.route).toBe(ROUTES.CV.PERSONAL_ROUTER_LINK);
    expect(step?.toggles).toEqual(['main-menu-cv', 'cv-personal']);
  });
});
