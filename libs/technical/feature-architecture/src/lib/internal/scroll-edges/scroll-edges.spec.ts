import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollEdges } from './scroll-edges';

@Component({
  imports: [ScrollEdges],
  template: `
    <div
      technicalScrollEdges
      style="overflow-x: auto; width: 200px"
      [style.--content-width.px]="contentWidth()">
      <div style="height: 10px; width: var(--content-width)"></div>
    </div>
  `,
})
class Host {
  readonly contentWidth = signal(600);
}

describe('ScrollEdges', () => {
  async function render(contentWidth: number) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.contentWidth.set(contentWidth);
    await fixture.whenStable();
    // the ResizeObserver reports after layout
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await fixture.whenStable();
    const element = (fixture.nativeElement as HTMLElement).querySelector(
      '[technicalScrollEdges]'
    ) as HTMLElement;
    return { fixture, element };
  }

  it('marks only the end while more content is to the right', async () => {
    // Arrange
    const contentWidth = 600;

    // Act
    const { element } = await render(contentWidth);

    // Assert
    expect(element.classList).not.toContain('scroll-edges--start');
    expect(element.classList).toContain('scroll-edges--end');
  });

  it('marks both edges in the middle, and only the start at the end', async () => {
    // Arrange
    const { fixture, element } = await render(600);

    // Act
    element.scrollLeft = 100;
    element.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    const middle = [...element.classList];
    element.scrollLeft = 400;
    element.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    const end = [...element.classList];

    // Assert
    expect(middle).toContain('scroll-edges--start');
    expect(middle).toContain('scroll-edges--end');
    expect(end).toContain('scroll-edges--start');
    expect(end).not.toContain('scroll-edges--end');
  });

  it('marks no edge when the content fits', async () => {
    // Arrange
    const contentWidth = 150;

    // Act
    const { element } = await render(contentWidth);

    // Assert
    expect(element.classList).not.toContain('scroll-edges--start');
    expect(element.classList).not.toContain('scroll-edges--end');
  });
});
