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
  {
    labelKey: 't.nav.cv',
    path: '',
    children: [
      { labelKey: 't.nav.home', path: 'home', icon: 'home' },
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
          { path: 'skills', component: Page },
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
      ...element.querySelectorAll<HTMLButtonElement>('.nav-accordion__toggle'),
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
    const { fixture, toggles, lists } = await setup('/home');

    // Act
    toggles[1].click();
    await fixture.whenStable();

    // Assert
    expect(lists.map((list) => list.hidden)).toEqual([true, false]);
  });

  it('closes the open domain when clicked again', async () => {
    // Arrange
    const { fixture, toggles, lists } = await setup('/home');

    // Act
    toggles[0].click();
    await fixture.whenStable();

    // Assert
    expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    expect(lists[0].hidden).toBe(true);
  });

  it('links to each page below its domain and marks the current one', async () => {
    // Arrange
    const url = '/skills';

    // Act
    const { element } = await setup(url);

    // Assert
    const links = [
      ...element.querySelectorAll<HTMLAnchorElement>('.nav-accordion__link'),
    ];
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/home',
      '/skills',
      '/showcase/admin',
    ]);
    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual([
      null,
      'page',
      null,
    ]);
  });
});
