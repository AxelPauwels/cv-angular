import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { ExperienceList } from './experience-list';

describe('ExperienceList', () => {
  it('lists the experiences from the cv api', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
    const fixture = TestBed.createComponent(ExperienceList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h2')).toBeTruthy();
    expect(element.querySelectorAll('li').length).toBeGreaterThan(0);
  });
});
