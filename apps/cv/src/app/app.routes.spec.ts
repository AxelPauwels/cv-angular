import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { appRoutes } from './app.routes';
import { App } from './app';

describe('appRoutes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  async function navigate(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const linkLabels = (selector: string) =>
      Array.from(element.querySelectorAll(`${selector} a`)).map(
        (link) => link.textContent?.trim() ?? ''
      );
    return {
      url: TestBed.inject(Router).url,
      main: linkLabels('lib-main-navbar > mat-toolbar'),
      activeMain: element
        .querySelector('lib-main-navbar > mat-toolbar .mdc-tab--active')
        ?.textContent?.trim(),
      sub: linkLabels('lib-sub-navbar'),
    };
  }

  it('defaults to the cv personal page', async () => {
    const page = await navigate('/');
    expect(page.url).toBe('/personal');
    expect(page.main).toEqual(['CV', 'Showcase', 'Technical']);
    expect(page.activeMain).toBe('CV');
    expect(page.sub).toEqual([
      'Personal',
      'Education',
      'Experience',
      'Skills',
      'References',
    ]);
  });

  it('shows the showcase sub items', async () => {
    const page = await navigate('/showcase');
    expect(page.url).toBe('/showcase/graphql-docs');
    expect(page.activeMain).toBe('Showcase');
    expect(page.sub).toEqual([
      'GraphQL docs',
      'Code coverage',
      'End-to-end tests',
    ]);
  });

  it('shows the technical sub items', async () => {
    const page = await navigate('/technical');
    expect(page.url).toBe('/technical/versions');
    expect(page.activeMain).toBe('Technical');
    expect(page.sub).toEqual(['Versions', 'Demo1']);
  });

  it('redirects unknown urls to the cv domain', async () => {
    const page = await navigate('/does-not-exist');
    expect(page.url).toBe('/personal');
  });

  it('navigates from the cv domain to the other domains', async () => {
    const harness = await RouterTestingHarness.create('/personal');
    const router = TestBed.inject(Router);

    await harness.navigateByUrl('/showcase');
    expect(router.url).toBe('/showcase/graphql-docs');

    await harness.navigateByUrl('/technical');
    expect(router.url).toBe('/technical/versions');
  });
});
