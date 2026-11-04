import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { EducationList } from './education-list';

describe('EducationList', () => {
  it('lists educations, certificates and additional learnings', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(EducationList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    const sections = element.querySelectorAll('section');
    expect(sections.length).toBe(3);
    for (const section of Array.from(sections)) {
      expect(section.querySelectorAll('li').length).toBeGreaterThan(0);
    }
    // specializations are translation keys, rendered in English
    expect(element.querySelector('li strong')?.textContent).not.toContain('t.');
    // a certificate without a url is shown as text, not as a broken link
    expect(element.querySelector('a[href="moved to adobe"]')).toBeNull();
  });
});
