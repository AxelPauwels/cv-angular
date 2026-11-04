import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { ExperienceList } from './experience-list';

describe('ExperienceList', () => {
  it('lists the experiences from the cv api', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(ExperienceList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('li').length).toBeGreaterThan(0);
    // positions are translation keys, rendered in English
    expect(element.querySelector('li strong')?.textContent).not.toContain('t.');
  });
});
