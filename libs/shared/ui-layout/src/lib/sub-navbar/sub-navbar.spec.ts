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
});
