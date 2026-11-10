import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { LoadingSpinner } from './loading-spinner';

@Component({
  imports: [LoadingSpinner],
  template: `<ds-loading-spinner />`,
})
class Host {}

describe('LoadingSpinner', () => {
  it('renders an indeterminate progressbar with the translated label', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: { en: { 't.common.loading': 'Loading' } },
          })
        ),
      ],
    });

    // Act
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    // Assert
    const spinner = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="progressbar"]'
    );
    expect(spinner).not.toBeNull();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading');
    expect(spinner?.hasAttribute('aria-valuenow')).toBe(false);
  });
});
