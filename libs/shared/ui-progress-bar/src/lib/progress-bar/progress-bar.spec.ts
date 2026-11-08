import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBar } from './progress-bar';

@Component({
  imports: [ProgressBar],
  template: `
    <ds-progress-bar [value]="70" label="Angular" [index]="2" />
    <ds-progress-bar [value]="140" />
  `,
})
class Host {}

describe('ProgressBar', () => {
  async function render(fixture: ComponentFixture<Host>) {
    await fixture.whenStable();
    const [labelled, decorative] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'ds-progress-bar'
      )
    );
    return { labelled, decorative };
  }

  it('is a named progress bar with its value when it has a label', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    const { labelled } = await render(fixture);

    // Assert
    expect(labelled.getAttribute('role')).toBe('progressbar');
    expect(labelled.getAttribute('aria-label')).toBe('Angular');
    expect(labelled.getAttribute('aria-valuenow')).toBe('70');
    expect(labelled.getAttribute('aria-valuemin')).toBe('0');
    expect(labelled.getAttribute('aria-valuemax')).toBe('100');
    expect(labelled.hasAttribute('aria-hidden')).toBe(false);
    expect(
      labelled.querySelector<HTMLElement>('.progress-bar__fill')?.style
        .inlineSize
    ).toBe('70%');
    expect(labelled.style.getPropertyValue('--ds-progress-bar-index')).toBe(
      '2'
    );
  });

  it('is hidden from screen readers without a label, and stays within 0 to 100', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    const { decorative } = await render(fixture);

    // Assert
    expect(decorative.getAttribute('aria-hidden')).toBe('true');
    expect(decorative.hasAttribute('role')).toBe(false);
    expect(
      decorative.querySelector<HTMLElement>('.progress-bar__fill')?.style
        .inlineSize
    ).toBe('100%');
  });
});
