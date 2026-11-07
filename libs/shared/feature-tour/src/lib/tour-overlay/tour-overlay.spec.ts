import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { FeatureToggleService, TourService } from '@cv/shared-data-access';
import { TourStep, TOUR_STEPS } from '../tour-steps';
import { TourOverlay } from './tour-overlay';

@Component({ template: '<button data-tour="first">first</button>' })
class FirstPage {}

@Component({ template: '<button data-tour="second">second</button>' })
class SecondPage {}

@Component({
  imports: [RouterOutlet, TourOverlay],
  template: '<router-outlet /><shared-tour />',
})
class Host {}

function step(
  id: string,
  route: string,
  target?: string,
  toggles?: TourStep['toggles']
): TourStep {
  return {
    id,
    route,
    target,
    toggles,
    labelKey: `t.tour.step.${id}.label`,
    titleKey: `t.tour.step.${id}.title`,
    textKey: `t.tour.step.${id}.text`,
  };
}

const steps = [
  step('themes', '/first', '[data-tour="first"]'),
  step('architecture', '/second', '[data-tour="second"]', [
    'main-menu-technical',
  ]),
  step('finish', '/second'),
];

describe('TourOverlay', () => {
  beforeEach(() => localStorage.clear());

  async function render(before?: () => void) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'first', component: FirstPage },
          { path: 'second', component: SecondPage },
        ]),
        provideI18nTesting(),
        { provide: TOUR_STEPS, useValue: steps },
      ],
    });
    before?.();
    const tour = TestBed.inject(TourService);
    tour.start();
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const query = (selector: string) =>
      element.querySelector<HTMLElement>(selector);
    const text = (selector: string) =>
      query(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    return { fixture, query, text, tour };
  }

  it('starts on the first page, highlighting its target', async () => {
    // Arrange & Act
    const { query, text } = await render();

    // Assert
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/first'));
    await vi.waitFor(() =>
      expect(query('.tour__spotlight')?.classList).toContain(
        'tour__spotlight--active'
      )
    );
    expect(query('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
    expect(text('.tour__title')).toBe('Color themes');
    expect(text('.tour__counter')).toBe('1 / 3');
    expect(query('.tour__action--back')?.getAttribute('aria-disabled')).toBe(
      'true'
    );
    expect(text('.tour__action--next')).toContain('Next Architecture');
  });

  it('skips the steps whose feature is switched off', async () => {
    // Arrange & Act
    const { text } = await render(() =>
      TestBed.inject(FeatureToggleService).change('main-menu-technical', false)
    );

    // Assert
    expect(text('.tour__counter')).toBe('1 / 2');
    expect(text('.tour__action--next')).toContain('Next Finish');
  });

  it('navigates to the next step and names the previous one', async () => {
    // Arrange
    const { query, text, fixture } = await render();

    // Act
    query('.tour__action--next')?.click();
    await fixture.whenStable();

    // Assert
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/second'));
    expect(text('.tour__title')).toBe('Architecture');
    expect(text('.tour__counter')).toBe('2 / 3');
    expect(text('.tour__action--back')).toContain('Back Themes');
    expect(text('.tour__action--next')).toContain('Next Finish');
  });

  it('steps with the arrow keys, centers steps without a target and finishes', async () => {
    // Arrange
    const { query, text, fixture, tour } = await render();
    const press = async (key: string) => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
      await fixture.whenStable();
    };

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

    // Act
    await press('ArrowLeft');

    // Assert
    expect(text('.tour__counter')).toBe('2 / 3');

    // Act
    await press('Escape');

    // Assert
    expect(tour.active()).toBe(false);
  });

  it('ends the tour from the last step', async () => {
    // Arrange
    const { query, fixture, tour } = await render();

    // Act
    query('.tour__action--next')?.click();
    await fixture.whenStable();
    query('.tour__action--next')?.click();
    await fixture.whenStable();
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
});
