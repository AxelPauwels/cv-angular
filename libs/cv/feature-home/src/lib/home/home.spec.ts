import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  FeatureToggleService,
  inBrowserGraphqlInterceptor,
  TourService,
} from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { Home } from './home';

describe('Home', () => {
  beforeEach(() => localStorage.clear());

  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the name and title from the cv api', async () => {
    const element = await render();

    expect(element.querySelector('h1')?.textContent).toContain('Axel Pauwels');
    expect(element.querySelector('.home-hero__title')?.textContent).toContain(
      'Senior Angular Front-End Developer'
    );
  });

  it('loads the full-bleed hero photo with priority and links to the next pages', async () => {
    const element = await render();
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
    expect(element.classList).toContain('o-container-bleed');
    expect(
      Array.from(element.querySelectorAll('.home-hero__actions a')).map(
        (link) => link.getAttribute('href')
      )
    ).toEqual(['/personal', '/experience']);
    expect(element.textContent).not.toContain('t.');
  });

  it('starts the tour from the button on the picture', async () => {
    const element = await render();
    const button = element.querySelector<HTMLButtonElement>('.home-hero__tour');

    expect(button?.textContent).toContain('Start the tour');
    button?.click();

    expect(TestBed.inject(TourService).active()).toBe(true);
  });

  it('hides the tour button when its feature toggle is off', async () => {
    const element = await render();
    const toggles = TestBed.inject(FeatureToggleService);

    toggles.change('tour-button', false);
    TestBed.tick();
    expect(element.querySelector('.home-hero__tour')).toBeNull();

    toggles.change('tour-button', true);
    TestBed.tick();
    expect(element.querySelector('.home-hero__tour')).not.toBeNull();
  });
});
