import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { EducationList } from './education-list';

describe('EducationList', () => {
  it('shows the educations as a year timeline, then certificates and learnings', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(EducationList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const years = Array.from(element.querySelectorAll('.timeline__year')).map(
      (icon) => Number(icon.textContent?.trim())
    );
    expect(years.length).toBeGreaterThan(1);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    // the end year is on the line: the bachelor ran 2015 – 2018
    expect(years[0]).toBe(2018);

    const cards = element.querySelectorAll('ds-card');
    expect(cards.length).toBe(2);
    for (const card of Array.from(cards)) {
      expect(card.querySelectorAll('li').length).toBeGreaterThan(0);
    }
    // specializations are translation keys, rendered in English
    expect(element.textContent).not.toContain('t.');
    // a certificate without a url is shown as text, not as a broken link
    expect(element.querySelector('a[href="moved to adobe"]')).toBeNull();
  });
});
