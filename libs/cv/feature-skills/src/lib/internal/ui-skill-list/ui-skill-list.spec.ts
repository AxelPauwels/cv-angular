import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SkillEntry } from '@cv/cv-data-access-skills';
import { UiSkillList } from './ui-skill-list';

@Component({
  imports: [UiSkillList],
  template: `<cv-ui-skill-list [entries]="entries" />`,
})
class Host {
  readonly entries: SkillEntry[] = [
    { name: 'Angular', level: 5, icon: 'angular' },
    { name: 'React', level: 3, icon: 'react' },
  ];
}

describe('UiSkillList', () => {
  it('lists a skill per entry, in order', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    await fixture.whenStable();
    const items = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'ul > li > cv-ui-skill'
      )
    ) as HTMLElement[];

    // Assert
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Angular',
      'React',
    ]);
    expect(
      items[1]
        .querySelector<HTMLElement>('ds-progress-dots')
        ?.style.getPropertyValue('--ds-progress-dots-index')
    ).toBe('1');
  });
});
