import { TestBed } from '@angular/core/testing';
import { ScoreGauge } from './score-gauge';

function render(score: number): HTMLElement {
  const fixture = TestBed.createComponent(ScoreGauge);
  fixture.componentRef.setInput('score', score);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('ScoreGauge', () => {
  it.each([
    [42, 'score-gauge--fail'],
    [61, 'score-gauge--average'],
    [95, 'score-gauge--pass'],
  ])('shows %i in the color of its band', (score, modifier) => {
    // Act
    const element = render(score);

    // Assert
    expect(element.textContent?.trim()).toBe(`${score}`);
    expect(element.classList).toContain(modifier);
  });

  it('fills the ring up to the score and hides it from screen readers', () => {
    // Act
    const element = render(50);

    // Assert
    const svg = element.querySelector('svg');
    const [filled, total] = (
      element
        .querySelector('.score-gauge__arc')
        ?.getAttribute('stroke-dasharray') ?? ''
    )
      .split(' ')
      .map(Number);
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(filled / total).toBeCloseTo(0.5);
  });
});
