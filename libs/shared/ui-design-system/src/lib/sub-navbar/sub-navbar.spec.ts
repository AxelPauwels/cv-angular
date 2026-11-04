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

    const hrefs = Array.from(element.querySelectorAll('a')).map((link) =>
      link.getAttribute('href')
    );
    expect(hrefs).toEqual(['/domain/one', '/domain/two']);
    expect(element.querySelector('.mdc-tab--active')?.textContent?.trim()).toBe(
      't.nav.Two'
    );
  });
});
