import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { SubNavbar } from './sub-navbar';

@Component({
  imports: [SubNavbar],
  template: `<ds-sub-navbar
    [items]="[
      { labelKey: 't.nav.Home', path: 'home', icon: 'home' },
      { labelKey: 't.nav.One', path: 'one' },
      { labelKey: 't.nav.Two', path: 'two' },
    ]"
    labelKey="Domain navigation" />`,
})
class Shell {}

@Component({ template: '' })
class Page {}

describe('SubNavbar', () => {
  it('links relative to the shell route and marks the current page active', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [
        // no translations: keys render as-is
        provideTolgee(() => Tolgee().init({ language: 'en' })),
        provideRouter([
          {
            path: 'domain',
            component: Shell,
            children: [
              { path: 'one', component: Page },
              { path: 'two', component: Page },
            ],
          },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/domain/two');
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    const hrefs = Array.from(element.querySelectorAll('a')).map((link) =>
      link.getAttribute('href')
    );
    expect(hrefs).toEqual(['/domain/home', '/domain/one', '/domain/two']);
    expect(element.querySelector('.mdc-tab--active')?.textContent?.trim()).toBe(
      't.nav.Two'
    );
  });

  it('shows an icon tab with its label as accessible name', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() => Tolgee().init({ language: 'en' })),
        provideRouter([
          {
            path: 'domain',
            component: Shell,
            children: [{ path: '**', component: Page }],
          },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/domain/home');
    await harness.fixture.whenStable();
    const link: HTMLAnchorElement =
      harness.fixture.nativeElement.querySelector('a');

    // Assert
    expect(link.getAttribute('aria-label')).toBe('t.nav.Home');
    expect(link.querySelector('mat-icon')?.textContent?.trim()).toBe('home');
    expect(link.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(link.classList).toContain('mdc-tab--active');
  });
});
