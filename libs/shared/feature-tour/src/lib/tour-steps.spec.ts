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
      'cv',
      'technical',
      'showcase',
      'contact',
      'finish',
    ]);
    expect(steps[0].route).toBe(ROUTES.HOME.ROOT_ROUTER_LINK);
    expect(steps.at(-1)?.route).toBe(ROUTES.HOME.ROOT_ROUTER_LINK);
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

  it('gives the navbar one frame and the phone menu rows their own', () => {
    // Arrange
    const steps = DEFAULT_TOUR_STEPS;

    // Act
    const frames = Object.fromEntries(
      steps.map(({ id, spotlight, menuSpotlight }) => [
        id,
        { spotlight, menuSpotlight },
      ])
    );

    // Assert
    // 5px around the download button, 1px off the bottom: 49px high, with its
    // 0.75rem corner grown by 5px
    const navbar = {
      padding: 5,
      radius: 'calc(0.75rem + 5px)',
      trim: { bottom: 1 },
    };
    const domain = {
      // the 48px tab framed on the same line as the download button
      spotlight: { ...navbar, trim: { top: 4, bottom: 5 } },
      // the menu row from the divider above it, 48px high
      menuSpotlight: { trim: { top: 7, bottom: 9 } },
    };
    const none = { spotlight: undefined, menuSpotlight: undefined };
    expect(frames).toEqual({
      'download-cv': { ...none, spotlight: navbar },
      settings: { ...none, spotlight: navbar },
      cv: domain,
      technical: domain,
      showcase: domain,
      contact: none,
      finish: none,
    });
  });
});
