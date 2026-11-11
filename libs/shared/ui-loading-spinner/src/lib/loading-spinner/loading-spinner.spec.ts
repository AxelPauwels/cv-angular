import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { LoadingSpinner } from './loading-spinner';

@Component({
  imports: [LoadingSpinner],
  template: `<ds-loading-spinner />`,
})
class Host {}

@Component({
  imports: [LoadingSpinner],
  template: `<ds-loading-spinner label="t.tour.loading" [diameter]="24" />`,
})
class CustomHost {}

describe('LoadingSpinner', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: {
              en: {
                't.common.loading': 'Loading',
                't.tour.loading': 'Loading the next step',
              },
            },
          })
        ),
      ],
    });
  });

  async function render(host: typeof Host | typeof CustomHost) {
    const fixture = TestBed.createComponent(host);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[role="progressbar"]'
    );
  }

  it('renders an indeterminate progressbar with the translated label', async () => {
    // Arrange
    const host = Host;

    // Act
    const spinner = await render(host);

    // Assert
    expect(spinner).not.toBeNull();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading');
    expect(spinner?.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('is 50px wide by default', async () => {
    // Arrange
    const host = Host;

    // Act
    const spinner = await render(host);

    // Assert
    expect(spinner?.style.width).toBe('50px');
    expect(spinner?.style.height).toBe('50px');
  });

  it('takes another label and size', async () => {
    // Arrange
    const host = CustomHost;

    // Act
    const spinner = await render(host);

    // Assert
    expect(spinner?.getAttribute('aria-label')).toBe('Loading the next step');
    expect(spinner?.style.width).toBe('24px');
    expect(spinner?.style.height).toBe('24px');
  });
});
