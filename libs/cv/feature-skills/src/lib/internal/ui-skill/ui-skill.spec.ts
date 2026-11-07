import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiSkill } from './ui-skill';

@Component({
  imports: [UiSkill],
  template: `<cv-ui-skill
    name="Angular"
    icon="angular"
    [level]="4"
    [index]="2" />`,
})
class Host {}

describe('UiSkill', () => {
  it('shows the icon, the name and a labelled dot per level', async () => {
    // Arrange & Act
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const skill = (fixture.nativeElement as HTMLElement).querySelector(
      'cv-ui-skill'
    ) as HTMLElement;

    // Assert
    const icon = skill.querySelector('.ui-skill__icon');
    expect(icon?.classList).toContain('cv-icon-angular');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(skill.querySelector('.ui-skill__name')?.textContent).toBe('Angular');

    const dots = skill.querySelector('[role="meter"]');
    expect(dots?.getAttribute('aria-label')).toBe('Angular');
    expect(dots?.getAttribute('aria-valuenow')).toBe('4');
    expect(dots?.getAttribute('aria-valuemax')).toBe('5');
    expect(
      (dots as HTMLElement).style.getPropertyValue('--ds-progress-dots-index')
    ).toBe('2');
  });
});
