import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  FeatureToggleService,
  inBrowserGraphqlInterceptor,
  saveFeatureTogglesForTesting,
  TourService,
} from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { Home } from './home';

describe('Home', () => {
  beforeEach(() => localStorage.clear());

  function configure() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
  }

  async function render() {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const text = (element: Element | null) =>
    element?.textContent?.replace(/\s+/g, ' ').trim();

  it('shows the name and title from the cv api', async () => {
    // Arrange
    configure();

    // Act
    const element = await render();

    // Assert
    expect(element.querySelector('h1')?.textContent).toContain('Axel Pauwels');
    expect(text(element.querySelector('.home-hero__title'))).toBe(
      'Senior Angular Front-End Developer'
    );
  });

  it('loads the full-bleed hero photo with priority and links to the next pages', async () => {
    // Arrange
    configure();

    // Act
    const element = await render();

    // Assert
    const image = element.querySelector('img');
    const sources = Array.from(element.querySelectorAll('picture source'));
    expect(image?.getAttribute('fetchpriority')).toBe('high');
    expect(image?.getAttribute('alt')).toBe('Portrait of Axel Pauwels');
    expect(sources.map((source) => source.getAttribute('type'))).toEqual([
      'image/avif',
      'image/webp',
    ]);
    expect(sources[0].getAttribute('srcset')).toContain(
      'axel-landscape-3840x2160.avif 3840w'
    );
    expect(
      Array.from(element.querySelectorAll('.home-hero__actions a')).map(
        (link) => link.getAttribute('href')
      )
    ).toEqual(['/personal', '/experience']);
    expect(element.textContent).not.toContain('t.');
  });

  it('starts the tour from the button on the picture', async () => {
    // Arrange
    saveFeatureTogglesForTesting({ 'tour-button': true });
    configure();
    const element = await render();
    const button = element.querySelector<HTMLButtonElement>('.home-hero__tour');

    // Act
    button?.click();

    // Assert
    expect(button?.textContent).toContain('Start the tour');
    expect(TestBed.inject(TourService).active()).toBe(true);
  });

  it.each(['pointerenter', 'focusin'])(
    'stops the glow on the tour button for good after %s',
    async (type) => {
      // Arrange
      saveFeatureTogglesForTesting({ 'tour-button': true });
      configure();
      const element = await render();
      const glow = element.querySelector('.home-hero__tour-glow');
      const stopped = 'home-hero__tour-glow--stopped';
      expect(glow?.classList).not.toContain(stopped);

      // Act
      glow?.dispatchEvent(new Event(type, { bubbles: true }));
      TestBed.tick();

      // Assert
      expect(glow?.classList).toContain(stopped);
    }
  );

  it('hides the tour button when its feature toggle is off', async () => {
    // Arrange
    saveFeatureTogglesForTesting({ 'tour-button': true });
    configure();
    const element = await render();

    // Act
    TestBed.inject(FeatureToggleService).change('tour-button', false);
    TestBed.tick();

    // Assert
    expect(element.querySelector('.home-hero__tour')).toBeNull();
  });

  it('shows the tour button when its feature toggle is on', async () => {
    // Arrange
    saveFeatureTogglesForTesting({ 'tour-button': false });
    configure();
    const element = await render();

    // Act
    TestBed.inject(FeatureToggleService).change('tour-button', true);
    TestBed.tick();

    // Assert
    expect(element.querySelector('.home-hero__tour')).not.toBeNull();
  });
});
