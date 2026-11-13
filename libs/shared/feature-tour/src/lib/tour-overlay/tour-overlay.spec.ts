import { Component, inject, signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import {
  saveFeatureTogglesForTesting,
  TourService,
} from '@cv/shared-data-access';
import { TourStep, TOUR_STEPS } from '../tour-steps';
import { TourOverlay } from './tour-overlay';

@Component({
  template: `
    <button
      data-tour="first"
      style="position: fixed; top: 10px; left: 10px; width: 40px; height: 20px">
      a
    </button>
    <button
      data-tour="first"
      style="position: fixed; top: 10px; left: 110px; width: 40px; height: 20px">
      b
    </button>
  `,
})
class FirstPage {}

@Component({ template: '<button data-tour="second">second</button>' })
class SecondPage {}

/** A target in the lower half of the viewport */
@Component({
  template: `
    <button
      data-tour="bottom"
      style="position: fixed; bottom: 10px; left: 10px; width: 40px; height: 20px">
      bottom
    </button>
  `,
})
class BottomPage {}

/** A target that renders late, like a page waiting for its data */
@Component({
  template: `
    @if (ready()) {
      <button data-tour="slow">slow</button>
    }
  `,
})
class SlowPage {
  protected readonly ready = signal(false);

  constructor() {
    setTimeout(() => this.ready.set(true), 800);
  }
}

@Component({
  imports: [RouterOutlet, TourOverlay],
  template: '<router-outlet /><shared-tour />',
})
class Host {}

/** A phone: the hamburger menu shows, its panel only while the tour opens it */
@Component({
  imports: [RouterOutlet, TourOverlay],
  template: `
    <button
      data-tour="menu"
      style="position: fixed; top: 0; left: 0; width: 40px; height: 40px">
      menu
    </button>
    @if (tour.menuOpen()) {
      <div data-tour="menu-panel">
        <button data-tour="menu-second">second</button>
      </div>
    }
    <router-outlet /><shared-tour />
  `,
})
class PhoneHost {
  protected readonly tour = inject(TourService);
}

function step(
  id: string,
  route: string,
  target?: string,
  toggles?: TourStep['toggles'],
  someToggles?: TourStep['someToggles']
): TourStep {
  return {
    id,
    route,
    target,
    toggles,
    someToggles,
    labelKey: `t.tour.step.${id}.label`,
    titleKey: `t.tour.step.${id}.title`,
    textKey: `t.tour.step.${id}.text`,
  };
}

const steps = [
  step('settings', '/first', '[data-tour="first"]', undefined, [
    'navbar-theme-switcher',
    'navbar-font-switcher',
  ]),
  step('technical', '/second', '[data-tour="second"]', ['main-menu-technical']),
  step('finish', '/second'),
];

describe('TourOverlay', () => {
  beforeEach(() => {
    localStorage.clear();
    // every feature on, whatever the defaults
    saveFeatureTogglesForTesting();
  });

  async function render(host: Type<unknown> = Host, tourSteps = steps) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'first', component: FirstPage },
          { path: 'second', component: SecondPage },
          { path: 'bottom', component: BottomPage },
          { path: 'slow', component: SlowPage },
        ]),
        provideI18nTesting(),
        { provide: TOUR_STEPS, useValue: tourSteps },
      ],
    });
    const tour = TestBed.inject(TourService);
    tour.start();
    const fixture = TestBed.createComponent(host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const query = (selector: string) =>
      element.querySelector<HTMLElement>(selector);
    const text = (selector: string) =>
      query(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    const press = async (key: string) => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
      await fixture.whenStable();
    };
    return { fixture, query, text, tour, press };
  }

  it('starts on the first page, highlighting its target', async () => {
    // Arrange
    const firstPage = '/first';

    // Act
    const { query, text } = await render();

    // Assert
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe(firstPage));
    await vi.waitFor(() =>
      expect(query('.tour__spotlight')?.classList).toContain(
        'tour__spotlight--active'
      )
    );
    expect(query('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
    expect(text('.tour__title')).toBe('Preferences');
    expect(text('.tour__counter')).toBe('1 / 3');
    expect(query('.tour__action--back')?.getAttribute('aria-disabled')).toBe(
      'true'
    );
    expect(text('.tour__action--next')).toContain('Next Technical');
  });

  it('skips the steps whose feature is switched off', async () => {
    // Arrange
    saveFeatureTogglesForTesting({ 'main-menu-technical': false });

    // Act
    const { text } = await render();

    // Assert
    expect(text('.tour__counter')).toBe('1 / 2');
    expect(text('.tour__action--next')).toContain('Next Finish');
  });

  it('spotlights all targets of a step at once', async () => {
    // Arrange
    const padding = 8;

    // Act
    const { query } = await render();

    // Assert
    const spotlight = await vi.waitFor(() => {
      const element = query('.tour__spotlight--active');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(spotlight.style.left).toBe(`${10 - padding}px`);
    expect(spotlight.style.width).toBe(`${140 + padding * 2}px`);
  });

  it('frames a target with its own padding, trim and corner', async () => {
    // Arrange
    const framed: TourStep[] = [
      {
        ...step('settings', '/first', '[data-tour="first"]'),
        spotlight: { padding: 5, radius: '20px', trim: { top: 4, bottom: 1 } },
      },
      step('finish', '/second'),
    ];

    // Act
    const { query } = await render(Host, framed);

    // Assert
    const spotlight = await vi.waitFor(() => {
      const element = query('.tour__spotlight--active');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    const rects = Array.from(
      document.querySelectorAll('[data-tour="first"]')
    ).map((target) => target.getBoundingClientRect());
    const top = Math.min(...rects.map((rect) => rect.top));
    const left = Math.min(...rects.map((rect) => rect.left));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    expect(parseFloat(spotlight.style.top)).toBeCloseTo(top + 4 - 5);
    expect(parseFloat(spotlight.style.left)).toBeCloseTo(left - 5);
    expect(parseFloat(spotlight.style.height)).toBeCloseTo(
      bottom - top - 4 - 1 + 5 * 2
    );
    expect(spotlight.style.borderRadius).toBe('20px');
  });

  it('keeps the default frame and corner for a step without its own', async () => {
    // Arrange
    const padding = 8;

    // Act
    const { query } = await render();

    // Assert
    const spotlight = await vi.waitFor(() => {
      const element = query('.tour__spotlight--active');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    const rects = Array.from(
      document.querySelectorAll('[data-tour="first"]')
    ).map((target) => target.getBoundingClientRect());
    const top = Math.min(...rects.map((rect) => rect.top));
    expect(parseFloat(spotlight.style.top)).toBeCloseTo(top - padding);
    expect(spotlight.style.borderRadius).toBe('');
  });

  it('keeps a step while one of its some-toggles is on', async () => {
    // Arrange
    saveFeatureTogglesForTesting({ 'navbar-theme-switcher': false });

    // Act
    const { text } = await render();

    // Assert
    expect(text('.tour__counter')).toBe('1 / 3');
  });

  it('skips a step when all of its some-toggles are off', async () => {
    // Arrange
    saveFeatureTogglesForTesting({
      'navbar-theme-switcher': false,
      'navbar-font-switcher': false,
    });

    // Act
    const { text } = await render();

    // Assert
    expect(text('.tour__counter')).toBe('1 / 2');
    expect(text('.tour__title')).toBe('Technical');
  });

  it('navigates to the next step and names the previous one', async () => {
    // Arrange
    const { query, text, fixture } = await render();

    // Act
    query('.tour__action--next')?.click();
    await fixture.whenStable();

    // Assert
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/second'));
    expect(text('.tour__title')).toBe('Technical');
    expect(text('.tour__counter')).toBe('2 / 3');
    expect(text('.tour__action--back')).toContain('Back Your preferences');
    expect(text('.tour__action--next')).toContain('Next Finish');
  });

  it('steps forward with the right arrow and centers steps without a target', async () => {
    // Arrange
    const { query, text, press } = await render();

    // Act
    await press('ArrowRight');
    await press('ArrowRight');

    // Assert
    await vi.waitFor(() =>
      expect(query('.tour__spotlight')?.classList).not.toContain(
        'tour__spotlight--active'
      )
    );
    expect(text('.tour__counter')).toBe('3 / 3');
    expect(text('.tour__action--next')).toContain('Finish');
  });

  it('steps back with the left arrow', async () => {
    // Arrange
    const { text, press } = await render();
    await press('ArrowRight');
    await press('ArrowRight');

    // Act
    await press('ArrowLeft');

    // Assert
    expect(text('.tour__counter')).toBe('2 / 3');
  });

  it('ends the tour with Escape', async () => {
    // Arrange
    const { tour, press } = await render();

    // Act
    await press('Escape');

    // Assert
    expect(tour.active()).toBe(false);
  });

  it('ends the tour from the last step', async () => {
    // Arrange
    const { query, fixture, tour } = await render();
    query('.tour__action--next')?.click();
    await fixture.whenStable();
    query('.tour__action--next')?.click();
    await fixture.whenStable();

    // Act
    query('.tour__action--next')?.click();

    // Assert
    expect(tour.active()).toBe(false);
  });

  it('ends the tour with the exit button', async () => {
    // Arrange
    const { query, tour } = await render();

    // Act
    query('.tour__exit')?.click();

    // Assert
    expect(tour.active()).toBe(false);
  });

  it('stays on the first step with the left arrow', async () => {
    // Arrange
    const { text, press } = await render();

    // Act
    await press('ArrowLeft');

    // Assert
    expect(text('.tour__counter')).toBe('1 / 3');
    expect(text('.tour__title')).toBe('Preferences');
  });

  it('takes over Escape and the arrow keys from the page', async () => {
    // Arrange
    await render();
    const keys = ['ArrowRight', 'ArrowLeft', 'Escape'].map(
      (key) => new KeyboardEvent('keydown', { key, cancelable: true })
    );

    // Act
    for (const key of keys) document.dispatchEvent(key);

    // Assert
    expect(keys.map((key) => key.defaultPrevented)).toEqual([true, true, true]);
  });

  it('leaves other keys to the page', async () => {
    // Arrange
    const { text } = await render();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });

    // Act
    document.dispatchEvent(tab);

    // Assert
    expect(tab.defaultPrevented).toBe(false);
    expect(text('.tour__counter')).toBe('1 / 3');
  });

  it('names the dialog by the step title and announces the progress', async () => {
    // Arrange
    const { query, text, press } = await render();

    // Act
    await press('ArrowRight');

    // Assert
    const labelledBy =
      query('[role="dialog"]')?.getAttribute('aria-labelledby');
    expect(text(`#${labelledBy}`)).toBe('Technical');
    expect(query('.tour__card')?.getAttribute('aria-live')).toBe('polite');
    expect(text('.tour__card')).toContain('Step 2 of 3');
  });

  it('points up at a target in the upper half of the screen', async () => {
    // Arrange
    const page = () => render();

    // Act
    const { query } = await page();

    // Assert
    const pointer = await vi.waitFor(() => {
      const element = query('.tour__pointer--visible');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(pointer.classList).not.toContain('tour__pointer--down');
  });

  it('points down at a target in the lower half of the screen', async () => {
    // Arrange
    const bottomSteps = [step('bottom', '/bottom', '[data-tour="bottom"]')];

    // Act
    const { query } = await render(Host, bottomSteps);

    // Assert
    const pointer = await vi.waitFor(() => {
      const element = query('.tour__pointer--visible');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(pointer.classList).toContain('tour__pointer--down');
  });

  it('shows a loading status while the target is slow, and the spotlight after', async () => {
    // Arrange
    const slowSteps = [step('slow', '/slow', '[data-tour="slow"]')];

    // Act
    const { query, text } = await render(Host, slowSteps);

    // Assert
    await vi.waitFor(() =>
      expect(query('.tour__loading[role="status"]')).not.toBeNull()
    );
    expect(text('.tour__loading')).toBe('Loading the tour…');
    await vi.waitFor(
      () => {
        expect(query('.tour__loading')).toBeNull();
        expect(query('.tour__spotlight--active')).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  describe('on phones', () => {
    const menuSteps: TourStep[] = [
      step('settings', '/first', '[data-tour="first"]'),
      {
        ...step('technical', '/second', '[data-tour="second"]'),
        menuTarget: '[data-tour="menu-panel"] [data-tour="menu-second"]',
      },
      step('finish', '/second'),
    ];

    it('frames a step in the menu with its menu frame, not its target frame', async () => {
      // Arrange
      const framed: TourStep[] = [
        step('settings', '/first', '[data-tour="first"]'),
        {
          ...menuSteps[1],
          spotlight: { padding: 40, radius: '40px' },
          menuSpotlight: { trim: { top: 7, bottom: 9 } },
        },
        step('finish', '/second'),
      ];
      const { query, fixture } = await render(PhoneHost, framed);

      // Act
      query('.tour__action--next')?.click();
      await fixture.whenStable();

      // Assert
      const padding = 8;
      const row = await vi.waitFor(() => {
        const element = query('[data-tour="menu-second"]');
        expect(element).not.toBeNull();
        return (element as HTMLElement).getBoundingClientRect();
      });
      await vi.waitFor(() => {
        const spotlight = query('.tour__spotlight') as HTMLElement;
        expect(parseFloat(spotlight.style.top)).toBeCloseTo(
          row.top + 7 - padding
        );
        expect(parseFloat(spotlight.style.height)).toBeCloseTo(
          row.height - 7 - 9 + padding * 2
        );
        expect(spotlight.style.borderRadius).toBe('');
      });
    });

    it('follows a target that moves when the layout around it changes', async () => {
      // Arrange
      const padding = 8;
      const { query, fixture } = await render(PhoneHost, menuSteps);
      query('.tour__action--next')?.click();
      await fixture.whenStable();
      const target = await vi.waitFor(() => {
        const element = query('[data-tour="menu-second"]');
        expect(element).not.toBeNull();
        return element as HTMLElement;
      });
      await vi.waitFor(() =>
        expect(query('.tour__spotlight--active')).not.toBeNull()
      );

      // Act
      // something above the target grows (e.g. a group of the menu opening)
      const spacer = document.createElement('div');
      spacer.style.height = '100px';
      target.before(spacer);

      // Assert
      await vi.waitFor(() => {
        const spotlight = query('.tour__spotlight') as HTMLElement;
        expect(parseFloat(spotlight.style.top)).toBeCloseTo(
          target.getBoundingClientRect().top - padding
        );
      });
      spacer.remove();
    });

    it('opens the menu for a step inside it', async () => {
      // Arrange
      const { query, fixture, tour } = await render(PhoneHost, menuSteps);

      // Act
      query('.tour__action--next')?.click();
      await fixture.whenStable();

      // Assert
      await vi.waitFor(() => expect(tour.menuOpen()).toBe(true));
      await vi.waitFor(() =>
        expect(query('[data-tour="menu-second"]')).not.toBeNull()
      );
    });

    it('closes the menu on the steps outside it', async () => {
      // Arrange
      const { query, fixture, tour } = await render(PhoneHost, menuSteps);
      query('.tour__action--next')?.click();
      await fixture.whenStable();
      await vi.waitFor(() => expect(tour.menuOpen()).toBe(true));

      // Act
      query('.tour__action--next')?.click();
      await fixture.whenStable();

      // Assert
      await vi.waitFor(() => expect(tour.menuOpen()).toBe(false));
    });

    it('closes the menu when the tour ends', async () => {
      // Arrange
      const { query, fixture, tour } = await render(PhoneHost, menuSteps);
      query('.tour__action--next')?.click();
      await fixture.whenStable();
      await vi.waitFor(() => expect(tour.menuOpen()).toBe(true));

      // Act
      query('.tour__exit')?.click();

      // Assert
      expect(tour.menuOpen()).toBe(false);
    });

    it('centers a step without a spotlight when it is centered on phones', async () => {
      // Arrange
      const centered: TourStep[] = [
        {
          ...step('contact', '/first', '[data-tour="first"]'),
          centerOnPhones: true,
        },
      ];

      // Act
      const { query } = await render(PhoneHost, centered);

      // Assert
      expect(query('.tour__spotlight--active')).toBeNull();
      expect(query('.tour__pointer--visible')).toBeNull();
    });
  });
});
