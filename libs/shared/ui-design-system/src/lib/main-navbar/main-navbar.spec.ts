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
    // Act & Assert
    // labels are uppercased in the template
    expect(await activeLabelAt('/showcase/demo')).toBe('SHOWCASE');
  });

  it('falls back to the root item for urls no other item claims', async () => {
    // Act & Assert
    expect(await activeLabelAt('/about')).toBe('CV');
  });
});
