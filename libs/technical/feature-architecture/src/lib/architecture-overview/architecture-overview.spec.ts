import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArchitectureOverview, describeTag } from './architecture-overview';

describe('ArchitectureOverview', () => {
  async function render(answer: (http: HttpTestingController) => void) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(ArchitectureOverview);
    fixture.detectChanges();
    TestBed.tick();
    answer(TestBed.inject(HttpTestingController));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('puts every library in its domain and layer, and lists the rules', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http.expectOne('/build-info/architecture.json').flush({
        projects: [
          { name: 'cv', root: 'apps/cv', kind: 'app', dependencies: [] },
          {
            name: 'cv-feature-skills',
            root: 'libs/cv/feature-skills',
            kind: 'lib',
            domain: 'cv',
            layer: 'feature',
            dependencies: ['cv-data-access-skills'],
          },
          {
            name: 'cv-data-access-skills',
            root: 'libs/cv/data-access-skills',
            kind: 'lib',
            domain: 'cv',
            layer: 'data-access',
            dependencies: [],
          },
          {
            name: 'shared-util-types',
            root: 'libs/shared/util-types',
            kind: 'lib',
            domain: 'shared',
            layer: 'util',
            dependencies: [],
          },
        ],
        rules: [
          { from: 'domain:*', to: ['same domain', 'domain:shared'] },
          { from: 'type:api', to: [] },
        ],
      });

    // Act
    const element = await render(answer);

    // Assert
    const matrix = element.querySelector(
      '.architecture-overview__matrix'
    ) as HTMLElement;
    expect(
      Array.from(matrix.querySelectorAll('thead th')).map((th) =>
        th.textContent?.trim()
      )
    ).toEqual(['Domain', 'feature', 'data-access', 'util']);
    expect(
      Array.from(matrix.querySelectorAll('tbody th')).map((th) =>
        th.textContent?.trim()
      )
    ).toEqual(['cv', 'shared']);
    expect(matrix.textContent).toContain('cv-feature-skills');
    expect(matrix.textContent).not.toContain('cv-e2e');

    const rules = element.querySelector(
      '.architecture-overview__rules'
    ) as HTMLElement;
    expect(rules.textContent).toContain('same domain, shared');
    expect(rules.textContent).toContain('nothing');
  });

  it('explains how to generate the data when it is missing', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http
        .expectOne('/build-info/architecture.json')
        .flush('', { status: 404, statusText: 'Not Found' });

    // Act
    const element = await render(answer);

    // Assert
    expect(element.querySelector('table')).toBeNull();
    expect(element.textContent).toContain('build-info:build-info');
  });
});

describe('describeTag', () => {
  it('reads sheriff tags as words', () => {
    // Arrange
    const tags = ['type:data-access', 'domain:*', '*', 'root'];

    // Act
    const words = tags.map(describeTag);

    // Assert
    expect(words).toEqual([
      'data-access',
      'every domain',
      'everything',
      'the app itself',
    ]);
  });
});
