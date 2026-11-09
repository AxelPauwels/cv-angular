import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { MicroFrontends } from './micro-frontends';

describe('MicroFrontends', () => {
  it('shows the micro-frontend next to the mac window, with where it comes from', async () => {
    // Arrange
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    const fixture = TestBed.createComponent(MicroFrontends);

    // Act
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const [remote, library] = Array.from(element.querySelectorAll('ds-card'));
    expect(remote.querySelector('shared-wrapper')).toBeTruthy();
    expect(remote.querySelector('a')?.getAttribute('href')).toBe(
      'https://cv-angular-mfe.web.app'
    );
    expect(library.querySelector('lib-mac-window')).toBeTruthy();
  });
});
