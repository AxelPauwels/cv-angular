import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { MatTabNav } from '@angular/material/tabs';
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
    labelKey="t.nav.domain-navigation" />`,
})
class Shell {}

@Component({ template: '' })
class Page {}

describe('SubNavbar', () => {
  it('links relative to the shell route and marks the current page active', async () => {
    // Arrange
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

    // Act
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
    // Arrange
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

    // Act
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

  describe('keyboard scrolling with nothing focused', () => {
    @Component({
      imports: [SubNavbar],
      template: `<ds-sub-navbar
        [items]="[{ labelKey: 't.nav.One', path: 'one' }]"
        labelKey="t.nav.domain-navigation">
        <div style="height: 2000px">page</div>
      </ds-sub-navbar>`,
    })
    class TallPage {}

    async function render(): Promise<HTMLElement> {
      TestBed.configureTestingModule({
        providers: [
          provideTolgee(() => Tolgee().init({ language: 'en' })),
          provideRouter([]),
        ],
      });
      const fixture = TestBed.createComponent(TallPage);
      await fixture.whenStable();
      const panel: HTMLElement =
        fixture.nativeElement.querySelector('.sub-navbar__panel');
      // the scrolling panel, as from md up
      Object.assign(panel.style, {
        display: 'block',
        height: '400px',
        maxHeight: '400px',
        flex: 'none',
        overflowY: 'auto',
        scrollBehavior: 'auto',
      });
      return panel;
    }

    function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...init,
      });
      document.body.dispatchEvent(event);
      return event;
    }

    it('scrolls the panel by a line, a page, or to its ends', async () => {
      // Arrange
      const panel = await render();
      const bottom = panel.scrollHeight - panel.clientHeight;

      // Act
      const arrowDown = press('ArrowDown');
      const afterArrowDown = panel.scrollTop;
      press('PageDown');
      const afterPageDown = panel.scrollTop;
      press('ArrowUp');
      const afterArrowUp = panel.scrollTop;
      press('PageUp');
      const afterPageUp = panel.scrollTop;
      press(' ');
      const afterSpace = panel.scrollTop;
      press(' ', { shiftKey: true });
      const afterShiftSpace = panel.scrollTop;
      press('End');
      const afterEnd = panel.scrollTop;
      press('Home');
      const afterHome = panel.scrollTop;

      // Assert
      expect(arrowDown.defaultPrevented).toBe(true);
      expect(afterArrowDown).toBe(40);
      expect(afterPageDown).toBe(40 + 350);
      expect(afterArrowUp).toBe(350);
      expect(afterPageUp).toBe(0);
      expect(afterSpace).toBe(350);
      expect(afterShiftSpace).toBe(0);
      expect(afterEnd).toBe(bottom);
      expect(afterHome).toBe(0);
    });

    it('leaves other keys to the browser', async () => {
      // Arrange
      const panel = await render();

      // Act
      const event = press('a');

      // Assert
      expect(event.defaultPrevented).toBe(false);
      expect(panel.scrollTop).toBe(0);
    });

    it.each([
      ['Alt', { altKey: true }],
      ['Control', { ctrlKey: true }],
      ['Meta', { metaKey: true }],
    ])('leaves %s shortcuts to the browser', async (_, modifier) => {
      // Arrange
      const panel = await render();

      // Act
      const event = press('PageDown', modifier);

      // Assert
      expect(event.defaultPrevented).toBe(false);
      expect(panel.scrollTop).toBe(0);
    });

    it('leaves keys already handled, or sent to a focused element, alone', async () => {
      // Arrange
      const panel = await render();
      const handled = new KeyboardEvent('keydown', {
        key: 'PageDown',
        bubbles: true,
        cancelable: true,
      });
      handled.preventDefault();

      // Act
      document.body.dispatchEvent(handled);
      panel.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true })
      );

      // Assert
      expect(panel.scrollTop).toBe(0);
    });

    it('does nothing when the page fits in the panel', async () => {
      // Arrange
      const panel = await render();
      Object.assign(panel.style, { height: '3000px', maxHeight: 'none' });

      // Act
      const event = press('PageDown');

      // Assert
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('tabs that do not fit', () => {
    @Component({
      imports: [SubNavbar],
      // narrow, so the tabs overflow and Material shows its arrows
      template: `<div style="width: 220px">
        <ds-sub-navbar
          [items]="[
            { labelKey: 't.nav.first-long-tab', path: 'a' },
            { labelKey: 't.nav.second-long-tab', path: 'b' },
            { labelKey: 't.nav.third-long-tab', path: 'c' },
            { labelKey: 't.nav.fourth-long-tab', path: 'd' },
          ]"
          labelKey="t.nav.domain-navigation" />
      </div>`,
    })
    class NarrowShell {}

    async function render(): Promise<{
      nav: HTMLElement;
      list: HTMLElement;
      settle: () => Promise<void>;
    }> {
      TestBed.configureTestingModule({
        providers: [
          provideTolgee(() => Tolgee().init({ language: 'en' })),
          provideRouter(
            ['a', 'b', 'c', 'd'].map((path) => ({ path, component: Page }))
          ),
        ],
      });
      const fixture = TestBed.createComponent(NarrowShell);
      await fixture.whenStable();
      const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
      // shown from md up only; the test viewport may be narrower, so show it and
      // let Material measure again (it shows its arrows when the tabs overflow)
      nav.style.display = 'flex';
      const tabs = fixture.debugElement
        .query(By.directive(MatTabNav))
        .injector.get(MatTabNav);
      tabs.updatePagination();
      fixture.detectChanges();
      await fixture.whenStable();
      // Material moves this element (translateX) to scroll the tabs
      return {
        nav,
        list: nav.querySelector('.mat-mdc-tab-list') as HTMLElement,
        // Material applies the new position on its next change detection
        settle: async () => {
          fixture.detectChanges();
          await fixture.whenStable();
        },
      };
    }

    // the position Material set (the computed style would still be in its transition)
    const offset = (list: HTMLElement) =>
      new DOMMatrix(list.style.transform || 'none').m41;

    /** Clicks the tab; true when the click got through to the page */
    function click(tab: HTMLElement): boolean {
      let reached = false;
      const listener = () => (reached = true);
      document.addEventListener('click', listener);
      tab.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      );
      document.removeEventListener('click', listener);
      return reached;
    }

    function pointer(
      target: HTMLElement,
      type: string,
      clientX: number,
      pointerType = 'touch'
    ): void {
      target.dispatchEvent(
        new PointerEvent(type, { clientX, pointerType, bubbles: true })
      );
    }

    it('moves the tabs with a sideways wheel or trackpad scroll', async () => {
      // Arrange
      const { nav, list, settle } = await render();

      // Act
      const event = new WheelEvent('wheel', {
        deltaX: 60,
        bubbles: true,
        cancelable: true,
      });
      nav.dispatchEvent(event);

      await settle();

      // Assert
      expect(offset(list)).toBe(-60);
      expect(event.defaultPrevented).toBe(true);
    });

    it('moves the tabs with Shift + wheel, also when counted in lines (Firefox)', async () => {
      // Arrange
      const { nav, list, settle } = await render();

      // Act: three lines down with Shift, as Firefox reports one wheel notch
      nav.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 3,
          deltaMode: WheelEvent.DOM_DELTA_LINE,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
      await settle();

      // Assert
      expect(offset(list)).toBe(-120);
    });

    it('leaves a vertical scroll to the page', async () => {
      // Arrange
      const { nav, list, settle } = await render();

      // Act
      const event = new WheelEvent('wheel', {
        deltaY: 60,
        bubbles: true,
        cancelable: true,
      });
      nav.dispatchEvent(event);

      await settle();

      // Assert
      expect(offset(list)).toBe(0);
      expect(event.defaultPrevented).toBe(false);
    });

    it('moves the tabs with a swipe, and the swipe does not open a tab', async () => {
      // Arrange
      const { nav, list, settle } = await render();
      const tab = nav.querySelector('a') as HTMLElement;

      // Act
      pointer(tab, 'pointerdown', 200);
      pointer(tab, 'pointermove', 170);
      pointer(tab, 'pointermove', 150);
      pointer(tab, 'pointerup', 150);
      const clicked = click(tab);
      await settle();

      // Assert
      expect(offset(list)).toBe(-50);
      expect(clicked).toBe(false);
    });

    it('ignores mouse drags, and still opens a tab on a tap', async () => {
      // Arrange
      const { nav, list, settle } = await render();
      const tab = nav.querySelector('a') as HTMLElement;

      // Act
      pointer(tab, 'pointerdown', 100, 'mouse');
      pointer(tab, 'pointermove', 40, 'mouse');
      pointer(tab, 'pointerup', 40, 'mouse');
      await settle();
      const afterMouseDrag = offset(list);
      pointer(tab, 'pointerdown', 100);
      pointer(tab, 'pointermove', 98);
      pointer(tab, 'pointerup', 98);
      const clicked = click(tab);

      // Assert
      expect(afterMouseDrag).toBe(0);
      expect(clicked).toBe(true);
    });
  });
});
