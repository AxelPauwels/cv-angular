import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MacWindow } from './mac-window';

@Component({
  imports: [MacWindow],
  template: `
    <lib-mac-window>
      <h1 class="title">{{ title() }}</h1>
      @if (showDetails()) {
        <p class="details">Details</p>
      }
    </lib-mac-window>
  `,
})
class Host {
  readonly title = signal('Hello');
  readonly showDetails = signal(false);
}

function query(root: ParentNode, selector: string): Element {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`${selector} is not rendered`);
  }
  return element;
}

describe('MacWindow', () => {
  describe('on its own', () => {
    let fixture: ComponentFixture<MacWindow>;
    let element: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MacWindow],
      }).compileComponents();

      fixture = TestBed.createComponent(MacWindow);
      element = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('should create', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders a window with a title bar above the content area', () => {
      const window = query(element, '.mw');

      expect(
        Array.from(window.children).map((child) => child.className)
      ).toEqual(['mw__controls', 'mw__content']);
    });

    it('renders the red, yellow and green buttons in that order', () => {
      const buttons = Array.from(
        element.querySelectorAll('.mw__controls .mw__btn')
      );

      expect(buttons.map((button) => button.classList[1])).toEqual([
        'mw__btn--red',
        'mw__btn--yellow',
        'mw__btn--green',
      ]);
    });

    it('keeps the buttons decorative', () => {
      const controls = query(element, '.mw__controls');

      expect(controls.querySelectorAll('button, a, [tabindex]')).toHaveLength(
        0
      );
      expect(controls.textContent?.trim()).toBe('');
    });

    it('renders an empty content area without projected content', () => {
      expect(query(element, '.mw__content').children).toHaveLength(0);
    });
  });

  describe('with projected content', () => {
    let fixture: ComponentFixture<Host>;
    let content: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Host],
      }).compileComponents();

      fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      content = fixture.nativeElement.querySelector('.mw__content');
    });

    it('projects the content into the content area', () => {
      expect(content.querySelector('.title')?.textContent).toBe('Hello');
    });

    it('does not project content into the title bar', () => {
      expect(
        fixture.nativeElement.querySelector('.mw__controls .title')
      ).toBeNull();
    });

    it('updates when the projected content changes', async () => {
      fixture.componentInstance.title.set('Updated');
      fixture.componentInstance.showDetails.set(true);
      await fixture.whenStable();

      expect(content.querySelector('.title')?.textContent).toBe('Updated');
      expect(content.querySelector('.details')).not.toBeNull();
    });
  });
});
