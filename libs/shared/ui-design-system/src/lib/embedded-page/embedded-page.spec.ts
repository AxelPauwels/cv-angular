import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { EmbeddedPage } from './embedded-page';

describe('EmbeddedPage', () => {
  async function render(
    answer: (http: HttpTestingController) => void,
    loadOnRequest = false
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // a ui lib can't use data-access-i18n: keys render as they are
        provideTolgee(() => Tolgee().init({ language: 'en' })),
      ],
    });
    const fixture = TestBed.createComponent(EmbeddedPage);
    fixture.componentRef.setInput('src', '/coverage/index.html');
    fixture.componentRef.setInput('title', 't.heading.code-coverage');
    fixture.componentRef.setInput('loadOnRequest', loadOnRequest);
    fixture.detectChanges();
    TestBed.tick();

    answer(TestBed.inject(HttpTestingController));
    await fixture.whenStable();
    return fixture;
  }

  it('shows an existing page in an iframe', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http.expectOne('/coverage/index.html').flush('<html>coverage</html>');

    // Act
    const element = (await render(answer)).nativeElement as HTMLElement;

    // Assert
    // the same page title as every content page, no card around the report
    expect(element.querySelector('ds-page-title h1')?.textContent?.trim()).toBe(
      't.heading.code-coverage'
    );
    expect(element.querySelector('mat-card')).toBeNull();
    const frame = element.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe('/coverage/index.html');
    expect(frame?.title).toBe('t.heading.code-coverage');
    // a button opens the same page in a new browser tab
    const open = element.querySelector('a[matButton]');
    expect(open?.getAttribute('href')).toBe('/coverage/index.html');
    expect(open?.getAttribute('target')).toBe('_blank');
    expect(open?.querySelector('mat-icon')?.textContent?.trim()).toBe(
      'open_in_new'
    );
  });

  it('shows a message instead of the app nested in itself', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http
        .expectOne('/coverage/index.html')
        .flush('<html><body><app-root></app-root></body></html>');

    // Act
    const element = (await render(answer)).nativeElement as HTMLElement;

    // Assert
    expect(element.querySelector('iframe')).toBeNull();
    expect(element.textContent).toContain('not available');
  });

  it('shows a message when the page is missing', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http
        .expectOne('/coverage/index.html')
        .flush('', { status: 404, statusText: 'Not Found' });

    // Act
    const element = (await render(answer)).nativeElement as HTMLElement;

    // Assert
    expect(element.querySelector('iframe')).toBeNull();
    expect(element.textContent).toContain('not available');
  });

  it('loads a heavy page only when asked, and focuses it', async () => {
    // Arrange
    const answer = (http: HttpTestingController) =>
      http.expectOne('/coverage/index.html').flush('<html>coverage</html>');
    const fixture = await render(answer, true);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('iframe')).toBeNull();
    const button = element.querySelector<HTMLButtonElement>(
      '.embedded-page__placeholder button'
    );
    expect(button?.textContent?.trim()).toBe('t.common.load-report');

    // Act
    button?.click();
    await fixture.whenStable();

    // Assert
    const frame = element.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe('/coverage/index.html');
    expect(document.activeElement).toBe(frame);
  });
});
