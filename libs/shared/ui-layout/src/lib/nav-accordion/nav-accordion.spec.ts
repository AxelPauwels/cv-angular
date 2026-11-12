import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { NavItem } from '../nav-item';
import { NavAccordion } from './nav-accordion';

@Component({ template: '' })
class Page {}

const ITEMS: NavItem[] = [
  // no children: a link of its own instead of a group
  { labelKey: 't.nav.home', path: 'home', icon: 'home' },
  {
    labelKey: 't.nav.cv',
    path: 'cv',
    children: [
      { labelKey: 't.nav.personal', path: 'personal', icon: 'person' },
      { labelKey: 't.nav.skills', path: 'skills' },
    ],
  },
  {
    labelKey: 't.nav.showcase',
    path: 'showcase',
    children: [{ labelKey: 't.nav.admin', path: 'admin' }],
  },
];

describe('NavAccordion', () => {
  async function setup(url: string) {
    TestBed.configureTestingModule({
      providers: [
        // no translations: keys render as-is
        provideTolgee(() => Tolgee().init({ language: 'en' })),
        provideRouter([
          { path: 'home', component: Page },
          { path: 'cv/personal', component: Page },
          { path: 'cv/skills', component: Page },
          { path: 'showcase/admin', component: Page },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const fixture = TestBed.createComponent(NavAccordion);
    fixture.componentRef.setInput('items', ITEMS);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const toggles = [
      ...element.querySelectorAll<HTMLButtonElement>(
        'button.nav-accordion__toggle'
      ),
    ];
    const lists = [
      ...element.querySelectorAll<HTMLElement>('.nav-accordion__links'),
    ];
    return { fixture, element, toggles, lists };
  }

  it('opens the domain of the current url', async () => {
    // Arrange
    const url = '/showcase/admin';

    // Act
    const { toggles, lists } = await setup(url);

    // Assert
    expect(toggles.map((t) => t.getAttribute('aria-expanded'))).toEqual([
      'false',
      'true',
    ]);
    expect(lists.map((list) => list.hidden)).toEqual([true, false]);
  });

  it('opens one domain at a time', async () => {
    // Arrange
    const { fixture, toggles, lists } = await setup('/cv/personal');

    // Act
    toggles[1].click();
    await fixture.whenStable();

    // Assert
    expect(lists.map((list) => list.hidden)).toEqual([true, false]);
  });

  it('closes the open domain when clicked again', async () => {
    // Arrange
    const { fixture, toggles, lists } = await setup('/cv/personal');

    // Act
    toggles[0].click();
    await fixture.whenStable();

    // Assert
    expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    expect(lists[0].hidden).toBe(true);
  });

  it('links to each page below its domain and marks the current one', async () => {
    // Arrange
    const url = '/cv/skills';

    // Act
    const { element } = await setup(url);

    // Assert
    const links = [
      ...element.querySelectorAll<HTMLAnchorElement>('.nav-accordion__link'),
    ];
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/cv/personal',
      '/cv/skills',
      '/showcase/admin',
    ]);
    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual([
      null,
      'page',
      null,
    ]);
  });

  it('shows an item without pages as a link of its own, marked when current', async () => {
    // Arrange
    const url = '/home';

    // Act
    const { element, toggles, lists } = await setup(url);

    // Assert
    const home = element.querySelector<HTMLAnchorElement>(
      'a.nav-accordion__toggle'
    );
    expect(home?.getAttribute('href')).toBe('/home');
    expect(home?.getAttribute('aria-current')).toBe('page');
    expect(home?.getAttribute('aria-expanded')).toBeNull();
    expect(home?.classList).toContain('nav-accordion__toggle--current');
    expect(home?.querySelector('mat-icon')?.textContent?.trim()).toBe('home');
    // only the domains with pages are groups, all closed on the home page
    expect(toggles).toHaveLength(2);
    expect(lists.map((list) => list.hidden)).toEqual([true, true]);
  });
});
