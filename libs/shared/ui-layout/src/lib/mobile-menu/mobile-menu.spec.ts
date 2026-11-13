import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { MobileMenu } from './mobile-menu';

@Component({ template: '' })
class Page {}

@Component({
  imports: [MobileMenu],
  template: `
    <ds-mobile-menu
      [(open)]="open"
      [closeOnOutsideClick]="closeOnOutsideClick()">
      <a class="link" href="#">Page</a>
    </ds-mobile-menu>
    <p class="outside">Page content</p>
  `,
})
class Host {
  readonly open = signal(false);
  readonly closeOnOutsideClick = signal(true);
}

describe('MobileMenu', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() => Tolgee().init({ language: 'en' })),
        provideRouter([{ path: 'page', component: Page }]),
      ],
    });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector<HTMLButtonElement>(
      '.mobile-menu__trigger'
    );
    const panel = element.querySelector<HTMLElement>('.mobile-menu__panel');
    if (!button || !panel) {
      throw new Error('mobile menu not rendered');
    }
    return { fixture, element, button, panel };
  }

  it('starts closed, with a button that controls the panel', async () => {
    // Arrange
    const { button, panel } = await setup();

    // Act
    const expanded = button.getAttribute('aria-expanded');

    // Assert
    expect(expanded).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.hidden).toBe(true);
  });

  it('opens and closes with the button', async () => {
    // Arrange
    const { fixture, button, panel } = await setup();

    // Act
    button.click();
    await fixture.whenStable();
    const openAfterFirstClick = !panel.hidden;
    button.click();
    await fixture.whenStable();

    // Assert
    expect(openAfterFirstClick).toBe(true);
    expect(panel.hidden).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('closes on Escape and moves focus from the panel to the button', async () => {
    // Arrange
    const { fixture, element, button, panel } = await setup();
    document.body.append(element);
    button.click();
    await fixture.whenStable();
    const link = element.querySelector<HTMLAnchorElement>('.link');
    link?.focus();

    // Act
    link?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await fixture.whenStable();

    // Assert
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(button);
    element.remove();
  });

  it('closes after a navigation', async () => {
    // Arrange
    const { fixture, button, panel } = await setup();
    button.click();
    await fixture.whenStable();

    // Act
    await TestBed.inject(Router).navigateByUrl('/page');
    await fixture.whenStable();

    // Assert
    expect(panel.hidden).toBe(true);
  });

  it('closes on a click outside the menu, like the close button', async () => {
    // Arrange
    const { fixture, element, button, panel } = await setup();
    document.body.append(element);
    button.click();
    await fixture.whenStable();

    // Act
    element.querySelector<HTMLElement>('.outside')?.click();
    await fixture.whenStable();

    // Assert
    expect(panel.hidden).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    element.remove();
  });

  it('stays open on a click inside the panel', async () => {
    // Arrange
    const { fixture, element, button, panel } = await setup();
    document.body.append(element);
    button.click();
    await fixture.whenStable();

    // Act
    panel.click();
    await fixture.whenStable();

    // Assert
    expect(panel.hidden).toBe(false);
    element.remove();
  });

  it('stays open on a click outside while that is switched off', async () => {
    // Arrange
    const { fixture, element, button, panel } = await setup();
    document.body.append(element);
    fixture.componentInstance.closeOnOutsideClick.set(false);
    button.click();
    await fixture.whenStable();

    // Act
    element.querySelector<HTMLElement>('.outside')?.click();
    await fixture.whenStable();

    // Assert
    expect(panel.hidden).toBe(false);
    element.remove();
  });
});
