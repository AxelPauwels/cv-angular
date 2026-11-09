import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { BackToTop } from './back-to-top';

@Component({
  imports: [BackToTop],
  template: `
    <div #target tabindex="-1" class="top"></div>
    <ds-back-to-top [focusTarget]="target" />
  `,
})
class Host {}

describe('BackToTop', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideTolgee(() => Tolgee().init({ language: 'en' }))],
    });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector<HTMLButtonElement>(
      '.back-to-top__button'
    );
    if (!button) {
      throw new Error('back to top not rendered');
    }
    return { fixture, element, button };
  }

  function scrollTo(y: number): void {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    window.dispatchEvent(new Event('scroll'));
  }

  afterEach(() => {
    scrollTo(0);
    vi.restoreAllMocks();
  });

  it('stays hidden near the top', async () => {
    // Arrange
    const { fixture, button } = await setup();

    // Act
    scrollTo(window.innerHeight * 0.5);
    await fixture.whenStable();

    // Assert
    expect(button.classList).not.toContain('back-to-top__button--visible');
  });

  it('shows after half a screen height and hides again near the top', async () => {
    // Arrange
    const { fixture, button } = await setup();

    // Act
    scrollTo(window.innerHeight * 0.5 + 1);
    await fixture.whenStable();
    const shown = button.classList.contains('back-to-top__button--visible');
    scrollTo(0);
    await fixture.whenStable();

    // Assert
    expect(shown).toBe(true);
    expect(button.classList).not.toContain('back-to-top__button--visible');
  });

  it('scrolls to the top and moves the focus from the button to the target', async () => {
    // Arrange
    const { fixture, element, button } = await setup();
    document.body.append(element);
    const scroll = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    scrollTo(window.innerHeight * 2);
    await fixture.whenStable();
    button.focus();

    // Act
    button.click();

    // Assert
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    expect(document.activeElement).toBe(element.querySelector('.top'));
    element.remove();
  });
});
