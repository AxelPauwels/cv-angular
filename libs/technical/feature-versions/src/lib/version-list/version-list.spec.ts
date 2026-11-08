import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VersionList } from './version-list';

describe('VersionList', () => {
  async function render(answer: (http: HttpTestingController) => void) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(VersionList);
    fixture.detectChanges();
    TestBed.tick();
    answer(TestBed.inject(HttpTestingController));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists the versions per category', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http.expectOne('/build-info/versions.json').flush({
        packages: [
          {
            category: 'Runtime',
            name: 'node',
            label: 'Node.js',
            version: '24.15.0',
          },
          {
            category: 'Framework',
            name: '@angular/core',
            label: 'Angular',
            version: '22.2.4',
            range: '~22.2.0',
          },
          {
            category: 'Framework',
            name: 'typescript',
            label: 'TypeScript',
            version: '6.0.3',
            range: '~6.0.0',
          },
        ],
      });

    // Act
    const element = await render(answer);

    // Assert
    expect(
      Array.from(
        element.querySelectorAll('.version-list__card .card__title')
      ).map((th) => th.textContent?.trim())
    ).toEqual(['Runtime', 'Framework']);
    const angular = Array.from(element.querySelectorAll('tbody tr')).find(
      (row) => row.textContent?.includes('Angular')
    );
    expect(angular?.textContent).toContain('22.2.4');
    expect(angular?.querySelector('a')?.getAttribute('href')).toBe(
      'https://www.npmjs.com/package/@angular/core'
    );
  });

  it('explains how to generate the versions when they are missing', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http
        .expectOne('/build-info/versions.json')
        .flush('', { status: 404, statusText: 'Not Found' });

    // Act
    const element = await render(answer);

    // Assert
    expect(element.querySelector('table')).toBeNull();
    expect(element.textContent).toContain('build-info:build-info');
  });
});
