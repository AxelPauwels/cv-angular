import { Component, input } from '@angular/core';
import { MatTabNavPanel } from '@angular/material/tabs';
import { NavItem } from '../nav-item';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { MainNavbar } from './main-navbar';

@Component({ template: '' })
class Page {}

@Component({
  imports: [MainNavbar, MatTabNavPanel],
  template: `
    <ds-main-navbar [items]="items()" [tabPanel]="panel" />
    <mat-tab-nav-panel #panel />
  `,
})
class Host {
  readonly items = input.required<NavItem[]>();
}

describe('MainNavbar', () => {
  async function activeLabelAt(url: string) {
    TestBed.configureTestingModule({
      providers: [
        // no translations: keys render as-is
        provideTolgee(() => Tolgee().init({ language: 'en' })),
        provideRouter([
          { path: '', component: Page },
          { path: 'about', component: Page },
          { path: 'showcase/:page', component: Page },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const fixture = TestBed.createComponent(Host);
    fixture.componentRef.setInput('items', [
      { labelKey: 'CV', path: '' },
      { labelKey: 'Showcase', path: 'showcase' },
    ]);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    return element.querySelector('.mdc-tab--active')?.textContent?.trim();
  }

  it('marks the item matching the first url segment active', async () => {
    // Arrange
    const url = '/showcase/demo';

    // Act
    const active = await activeLabelAt(url);

    // Assert
    // labels are uppercased in the template
    expect(active).toBe('SHOWCASE');
  });

  it('falls back to the root item for urls no other item claims', async () => {
    // Arrange
    const url = '/about';

    // Act
    const active = await activeLabelAt(url);

    // Assert
    expect(active).toBe('CV');
  });

  it('shows an icon tab named by its label, and marks it active', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() => Tolgee().init({ language: 'en' })),
        provideRouter([
          { path: 'home', component: Page },
          { path: 'cv', component: Page },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/home');
    const fixture = TestBed.createComponent(Host);

    // Act
    fixture.componentRef.setInput('items', [
      { labelKey: 'Home', path: 'home', icon: 'home', tourId: 'menu-home' },
      { labelKey: 'CV', path: 'cv' },
    ]);
    await fixture.whenStable();

    // Assert
    const element: HTMLElement = fixture.nativeElement;
    const [home, cv] = Array.from(element.querySelectorAll('nav a'));
    expect(home.getAttribute('href')).toBe('/home');
    expect(home.getAttribute('aria-label')).toBe('Home');
    expect(home.getAttribute('data-tour')).toBe('menu-home');
    expect(home.querySelector('mat-icon')?.textContent?.trim()).toBe('home');
    expect(home.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(home.classList).toContain('mdc-tab--active');
    // a text tab has no aria-label: its text is its name
    expect(cv.getAttribute('aria-label')).toBeNull();
    expect(cv.textContent?.trim()).toBe('CV');
  });
});
