import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageLayout, PageLayoutWidth } from './page-layout';

@Component({
  imports: [PageLayout],
  template: `<ds-page-layout [width]="width"
    ><p class="content">Page</p></ds-page-layout
  >`,
})
class Host {
  width: PageLayoutWidth = 'wide';
}

describe('PageLayout', () => {
  async function render(width: PageLayoutWidth) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.width = width;
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const layout = element.querySelector<HTMLElement>('ds-page-layout');
    if (!layout) throw new Error('no ds-page-layout rendered');
    return layout;
  }

  it('projects the page with the same padding on every page', async () => {
    // Arrange & Act
    const layout = await render('wide');

    // Assert
    expect(layout.querySelector('.content')?.textContent).toBe('Page');
    const style = getComputedStyle(layout);
    expect(style.paddingTop).toBe('24px');
    expect(style.paddingLeft).toBe('16px');
    expect(style.paddingRight).toBe('16px');
    expect(style.paddingBottom).toBe('48px');
  });

  it('caps the content at 72rem by default', async () => {
    // Arrange & Act
    const layout = await render('wide');

    // Assert: the max width plus the padding on both sides
    expect(getComputedStyle(layout).maxWidth).toBe(`${72 * 16 + 32}px`);
  });

  it('caps the content at 52rem when narrow', async () => {
    // Arrange & Act
    const layout = await render('narrow');

    // Assert
    expect(layout.classList).toContain('ds-page-layout--narrow');
    expect(getComputedStyle(layout).maxWidth).toBe(`${52 * 16 + 32}px`);
  });
});
