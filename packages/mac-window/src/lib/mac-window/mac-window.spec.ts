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
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MacWindow],
      }).compileComponents();
    });

    async function render(): Promise<ComponentFixture<MacWindow>> {
      const fixture = TestBed.createComponent(MacWindow);
      await fixture.whenStable();
      return fixture;
    }

    it('should create', async () => {
      // Arrange
      const component = MacWindow;

      // Act
      const fixture = await render();

      // Assert
      expect(fixture.componentInstance).toBeInstanceOf(component);
    });

    it('renders a window with a title bar above the content area', async () => {
      // Arrange
      const selector = '.mw';

      // Act
      const { nativeElement } = await render();

      // Assert
      const window = query(nativeElement, selector);
      expect(
        Array.from(window.children).map((child) => child.className)
      ).toEqual(['mw__controls', 'mw__content']);
    });

    it('renders the red, yellow and green buttons in that order', async () => {
      // Arrange
      const selector = '.mw__controls .mw__btn';

      // Act
      const { nativeElement } = await render();

      // Assert
      const buttons = Array.from(
        (nativeElement as HTMLElement).querySelectorAll(selector)
      );
      expect(buttons.map((button) => button.classList[1])).toEqual([
        'mw__btn--red',
        'mw__btn--yellow',
        'mw__btn--green',
      ]);
    });

    it('keeps the buttons decorative', async () => {
      // Arrange
      const focusable = 'button, a, [tabindex]';

      // Act
      const { nativeElement } = await render();

      // Assert
      const controls = query(nativeElement, '.mw__controls');
      expect(controls.querySelectorAll(focusable)).toHaveLength(0);
      expect(controls.textContent?.trim()).toBe('');
    });

    it('renders an empty content area without projected content', async () => {
      // Arrange
      const selector = '.mw__content';

      // Act
      const { nativeElement } = await render();

      // Assert
      expect(query(nativeElement, selector).children).toHaveLength(0);
    });
  });

  describe('with projected content', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Host],
      }).compileComponents();
    });

    async function render(): Promise<ComponentFixture<Host>> {
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      return fixture;
    }

    it('projects the content into the content area', async () => {
      // Arrange
      const selector = '.mw__content .title';

      // Act
      const { nativeElement } = await render();

      // Assert
      expect(query(nativeElement, selector).textContent).toBe('Hello');
    });

    it('does not project content into the title bar', async () => {
      // Arrange
      const selector = '.mw__controls .title';

      // Act
      const { nativeElement } = await render();

      // Assert
      expect(nativeElement.querySelector(selector)).toBeNull();
    });

    it('updates when the projected content changes', async () => {
      // Arrange
      const fixture = await render();
      const content = query(fixture.nativeElement, '.mw__content');

      // Act
      fixture.componentInstance.title.set('Updated');
      fixture.componentInstance.showDetails.set(true);
      await fixture.whenStable();

      // Assert
      expect(content.querySelector('.title')?.textContent).toBe('Updated');
      expect(content.querySelector('.details')).not.toBeNull();
    });
  });
});
