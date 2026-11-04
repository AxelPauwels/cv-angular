import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { EmbeddedPage } from './embedded-page';

describe('EmbeddedPage', () => {
  async function render(answer: (http: HttpTestingController) => void) {
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
    fixture.componentRef.setInput('title', 't.nav.code-coverage');
    fixture.detectChanges();
    TestBed.tick();

    answer(TestBed.inject(HttpTestingController));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows an existing page in an iframe', async () => {
    const element = await render((http) =>
      http.expectOne('/coverage/index.html').flush('<html>coverage</html>')
    );

    const frame = element.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe('/coverage/index.html');
    expect(frame?.title).toBe('t.nav.code-coverage');
    // a button opens the same page in a new browser tab
    const open = element.querySelector('a[matButton]');
    expect(open?.getAttribute('href')).toBe('/coverage/index.html');
    expect(open?.getAttribute('target')).toBe('_blank');
    expect(open?.querySelector('mat-icon')?.textContent?.trim()).toBe(
      'open_in_new'
    );
  });

  it('shows a message instead of the app nested in itself', async () => {
    const element = await render((http) =>
      http
        .expectOne('/coverage/index.html')
        .flush('<html><body><app-root></app-root></body></html>')
    );

    expect(element.querySelector('iframe')).toBeNull();
    expect(element.textContent).toContain('not available');
  });

  it('shows a message when the page is missing', async () => {
    const element = await render((http) =>
      http
        .expectOne('/coverage/index.html')
        .flush('', { status: 404, statusText: 'Not Found' })
    );

    expect(element.querySelector('iframe')).toBeNull();
    expect(element.textContent).toContain('not available');
  });
});
