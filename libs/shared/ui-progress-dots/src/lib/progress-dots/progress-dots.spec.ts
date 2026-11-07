import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProgressDots } from './progress-dots';

@Component({
  imports: [ProgressDots],
  template: `
    <ds-progress-dots [value]="3.5" label="Angular" [index]="2" />
    <ds-progress-dots [value]="9" />
  `,
})
class Host {}

describe('ProgressDots', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [labelled, decorative] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'ds-progress-dots'
      )
    );
    return { labelled, decorative };
  }

  const filledDots = (element: HTMLElement) =>
    Array.from(
      element.querySelectorAll<HTMLElement>('.progress-dots__dot--filled')
    );

  it('is a named meter with its value, rounded down, when it has a label', async () => {
    // Arrange & Act
    const { labelled } = await render();

    // Assert
    expect(labelled.getAttribute('role')).toBe('meter');
    expect(labelled.getAttribute('aria-label')).toBe('Angular');
    expect(labelled.getAttribute('aria-valuenow')).toBe('3');
    expect(labelled.getAttribute('aria-valuemin')).toBe('0');
    expect(labelled.getAttribute('aria-valuemax')).toBe('5');
    expect(labelled.hasAttribute('aria-hidden')).toBe(false);
    expect(labelled.querySelectorAll('.progress-dots__dot')).toHaveLength(5);
    expect(filledDots(labelled)).toHaveLength(3);
    expect(labelled.style.getPropertyValue('--ds-progress-dots-index')).toBe(
      '2'
    );
  });

  it('is hidden from screen readers without a label, and stays within max', async () => {
    // Arrange & Act
    const { decorative } = await render();

    // Assert
    expect(decorative.getAttribute('aria-hidden')).toBe('true');
    expect(decorative.hasAttribute('role')).toBe(false);
    expect(filledDots(decorative)).toHaveLength(5);
  });
});
