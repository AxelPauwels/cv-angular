import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { ReferenceList } from './reference-list';

describe('ReferenceList', () => {
  it('lists the references per work category from the cv api', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(ReferenceList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // categories are translation keys, rendered in English
    expect(
      Array.from(element.querySelectorAll('h2')).map((h) =>
        h.textContent?.trim()
      )
    ).toEqual(['Hospitality', 'IT']);
    expect(element.querySelectorAll('li').length).toBeGreaterThan(0);
  });
});
