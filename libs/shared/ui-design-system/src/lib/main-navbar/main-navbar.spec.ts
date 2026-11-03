import { Component, input } from '@angular/core';
import { MatTabNavPanel } from '@angular/material/tabs';
import { NavItem } from '../nav-item';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
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
      { label: 'CV', path: '' },
      { label: 'Showcase', path: 'showcase' },
    ]);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    return element.querySelector('.mdc-tab--active')?.textContent?.trim();
  }

  it('marks the item matching the first url segment active', async () => {
    expect(await activeLabelAt('/showcase/demo')).toBe('Showcase');
  });

  it('falls back to the root item for urls no other item claims', async () => {
    expect(await activeLabelAt('/about')).toBe('CV');
  });
});
