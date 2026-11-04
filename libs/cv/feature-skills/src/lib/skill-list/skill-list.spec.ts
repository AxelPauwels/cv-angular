import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { SkillList } from './skill-list';

describe('SkillList', () => {
  it('lists the skills per category from the cv api', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(SkillList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    const headings = Array.from(element.querySelectorAll('h2'));
    expect(headings.length).toBeGreaterThan(0);
    // categories are translation keys, rendered in English
    for (const heading of headings) {
      expect(heading.textContent).not.toContain('t.');
    }
    expect(element.querySelectorAll('li meter').length).toBeGreaterThan(0);
  });
});
