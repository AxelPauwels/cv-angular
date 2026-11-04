import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { PersonalDetails } from './personal-details';

describe('PersonalDetails', () => {
  it('shows the person from the cv api', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(PersonalDetails);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('section strong')?.textContent).toContain(
      'Axel Pauwels'
    );
    expect(
      Array.from(element.querySelectorAll('h2')).map((h) =>
        h.textContent?.trim()
      )
    ).toEqual(['About me', "Let's talk", 'Hobbies & Interests', 'Languages']);
    // API values are translation keys, rendered in English
    expect(element.querySelector('dl')?.textContent).toContain('Married');
    expect(element.textContent).not.toContain('t.');
  });
});
