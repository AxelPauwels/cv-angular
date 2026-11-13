import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormatSimple, provideTolgee, Tolgee } from '@tolgee/ngx';
import { StoreLoadingError } from './store-loading-error';

@Component({
  imports: [StoreLoadingError],
  template: `<ds-store-loading-error
    message="t.error.load.skills"
    [error]="error" />`,
})
class Host {
  error: { message: string } | undefined = new Error('Network down');
}

describe('StoreLoadingError', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee()
            .use(FormatSimple())
            .init({
              language: 'en',
              staticData: {
                en: { 't.error.load.skills': 'Could not load skills: {error}' },
              },
            })
        ),
      ],
    });
  });

  async function render(error?: { message: string }) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.error = error;
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'ds-store-loading-error'
    );
  }

  it('shows the translated message with the error', async () => {
    // Arrange
    const error = new Error('Network down');

    // Act
    const element = await render(error);

    // Assert
    expect(element?.querySelector('p')?.textContent?.trim()).toBe(
      'Could not load skills: Network down'
    );
  });

  it('is announced as an alert', async () => {
    // Arrange
    const error = new Error('Network down');

    // Act
    const element = await render(error);

    // Assert
    expect(element?.getAttribute('role')).toBe('alert');
  });

  it('hides the icon from screen readers', async () => {
    // Arrange
    const error = new Error('Network down');

    // Act
    const element = await render(error);

    // Assert
    expect(
      element?.querySelector('mat-icon')?.getAttribute('aria-hidden')
    ).toBe('true');
  });
});
