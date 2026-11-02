import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SubNavbar } from './sub-navbar';

@Component({
  imports: [SubNavbar],
  template: `<lib-sub-navbar
    [items]="[
      { label: 'One', path: 'one' },
      { label: 'Two', path: 'two' },
    ]" />`,
})
class Shell {}

@Component({ template: '' })
class Page {}

describe('SubNavbar', () => {
  it('links relative to the shell route and marks the current page active', async () => {
    TestBed.configureTestingModule({
      providers: [
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
      'Two'
    );
  });
});
