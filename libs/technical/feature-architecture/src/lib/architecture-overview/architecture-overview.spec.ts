import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import type { ProjectInfo } from '@cv/technical-data-access-build-info';
import {
  ArchitectureOverview,
  describeTag,
  describeTargets,
} from './architecture-overview';

function lib(
  name: string,
  domain: string | undefined,
  layer: string | undefined,
  dependencies: string[] = []
): ProjectInfo {
  return {
    name,
    root: `libs/${name}`,
    kind: 'lib',
    domain,
    layer,
    dependencies,
  };
}

const answerWith = (projects: ProjectInfo[]) => (http: HttpTestingController) =>
  http
    .expectOne('/build-info/architecture.json')
    .flush({ projects, rules: [] });

const texts = (parent: Element, selector: string) =>
  Array.from(parent.querySelectorAll(selector)).map((node) =>
    node.textContent?.replace(/\s+/g, ' ').trim()
  );

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

  it('shows a labelled progress bar while the architecture loads', () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(ArchitectureOverview);

    // Act: the request stays unanswered (whenStable would wait for it)
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    // Assert
    const element = fixture.nativeElement as HTMLElement;
    TestBed.inject(HttpTestingController).expectOne(
      '/build-info/architecture.json'
    );
    expect(
      element.querySelector('mat-progress-bar')?.getAttribute('aria-label')
    ).toBe('Loading the architecture');
    expect(element.querySelector('table')).toBeNull();
  });

  it('counts the apps, domains, layers and libraries', async () => {
    // Arrange
    const answer = answerWith([
      { name: 'cv', root: 'apps/cv', kind: 'app', dependencies: [] },
      { name: 'cv-e2e', root: 'apps/cv-e2e', kind: 'e2e', dependencies: [] },
      lib('cv-feature-home', 'cv', 'feature'),
      lib('cv-data-access-skills', 'cv', 'data-access'),
      lib('shared-util-types', 'shared', 'util'),
    ]);

    // Act
    const element = await render(answer);

    // Assert
    const stats = element.querySelector(
      '.architecture-overview__stats'
    ) as HTMLElement;
    expect(texts(stats, 'dt')).toEqual([
      'Apps',
      'Domains',
      'Layers',
      'Libraries',
    ]);
    expect(texts(stats, 'dd')).toEqual(['2', '2', '3', '3']);
  });

  it('puts known domains and layers in reading order, unknown ones after', async () => {
    // Arrange
    const answer = answerWith([
      lib('zeta-ui-thing', 'zeta', 'ui'),
      lib('shared-util-types', 'shared', 'util'),
      lib('cv-feature-home', 'cv', 'feature'),
      lib('cv-untagged', 'cv', undefined),
    ]);

    // Act
    const element = await render(answer);

    // Assert
    const matrix = element.querySelector(
      '.architecture-overview__matrix'
    ) as HTMLElement;
    expect(texts(matrix, 'thead th')).toEqual([
      'Domain',
      'feature',
      'ui',
      'util',
      '–',
    ]);
    expect(texts(matrix, 'tbody th')).toEqual(['cv', 'shared', 'zeta']);
  });

  it('lists what every library imports, per domain', async () => {
    // Arrange
    const answer = answerWith([
      lib('cv-feature-skills', 'cv', 'feature', ['cv-data-access-skills']),
      lib('cv-data-access-skills', 'cv', 'data-access'),
    ]);

    // Act
    const element = await render(answer);

    // Assert
    const panel = element.querySelector('mat-expansion-panel') as HTMLElement;
    expect(texts(panel, 'mat-panel-title')).toEqual(['cv']);
    expect(texts(panel, 'mat-panel-description')).toEqual(['2 libraries']);
    const [skills, dataAccess] = Array.from(
      panel.querySelectorAll('.architecture-overview__dependency')
    );
    expect(texts(skills, 'dt')).toEqual(['cv-feature-skills']);
    expect(texts(skills, 'dd li')).toEqual(['cv-data-access-skills']);
    expect(texts(dataAccess, 'dt')).toEqual(['cv-data-access-skills']);
    expect(texts(dataAccess, 'dd')).toEqual(['no other project']);
  });

  it('lets the keyboard reach and scroll the wide tables', async () => {
    // Arrange
    const answer = answerWith([lib('cv-feature-home', 'cv', 'feature')]);

    // Act
    const element = await render(answer);

    // Assert
    const regions = Array.from(
      element.querySelectorAll('.architecture-overview__scroll')
    );
    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual([
      'Libraries per domain and layer',
      'Dependency rules',
    ]);
    for (const region of regions) {
      expect(region.getAttribute('role')).toBe('region');
      expect(region.getAttribute('tabindex')).toBe('0');
    }
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

describe('describeTargets', () => {
  it('joins the targets of a rule as words', () => {
    // Arrange
    const tags = ['same domain', 'domain:shared', 'type:util'];

    // Act
    const words = describeTargets(tags);

    // Assert
    expect(words).toBe('same domain, shared, util');
  });

  it('describes no targets as an empty text', () => {
    // Arrange
    const tags: string[] = [];

    // Act
    const words = describeTargets(tags);

    // Assert
    expect(words).toBe('');
  });
});
