import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { SkillList } from './skill-list';

describe('SkillList', () => {
  it('lists the skills per category from the cv api', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(SkillList);

    // Act
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const cards = Array.from(element.querySelectorAll('ds-card'));
    expect(cards.length).toBeGreaterThan(0);
    // categories are translation keys, rendered in English
    for (const card of cards) {
      expect(card.querySelector('h2')?.textContent).not.toContain('t.');
      expect(card.querySelector('cv-ui-skill-list')).not.toBeNull();
    }

    const dots = Array.from(
      element.querySelectorAll('ds-progress-dots[role="meter"]')
    );
    expect(dots.length).toBeGreaterThan(0);
    // labelled dots per skill, its level (0-5) as 0 to 5 dots
    expect(dots[0].getAttribute('aria-label')).toBeTruthy();
    expect(Number(dots[0].getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  });
});
