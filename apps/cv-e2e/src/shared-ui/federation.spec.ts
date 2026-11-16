import { expect, Page, test } from '@playwright/test';
import { open, PAGE_LOAD_TIMEOUT } from '../support/ui';

/**
 * `shared-cv-mfe` and `shared-wrapper` (shared-ui-federation): load a remote's
 * web component with Native Federation and pass it inputs. The real remote is
 * another deployment (or `nx serve cv-mfe` locally), so the tests serve a stub
 * remote in its place: whatever the manifest points at, its remoteEntry.json
 * and the module it exposes come from here.
 */
const STUB_MODULE = 'cv-mfe-e2e-stub.js';

/**
 * A remote's entry file, not the app's own: as a federation host it serves a
 * remoteEntry.json too, which must stay untouched
 */
const remoteEntryOf = (app: string | undefined) => (url: URL) =>
  url.pathname.endsWith('/remoteEntry.json') &&
  url.origin !== new URL(app ?? 'http://localhost').origin;

async function serveStubRemote(page: Page, app?: string): Promise<void> {
  await page.route(remoteEntryOf(app), (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'cv-mfe',
        shared: [],
        exposes: [{ key: './web-components', outFileName: STUB_MODULE }],
      }),
    })
  );
  await page.route(
    new RegExp(`/${STUB_MODULE.replace(/\./g, '\\.')}$`),
    (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: `
        class StubCvMfe extends HTMLElement {
          set snippet(value) {
            this._snippet = value;
            this.render();
          }
          get snippet() {
            return this._snippet;
          }
          connectedCallback() {
            this.render();
          }
          render() {
            this.innerHTML = '';
            const code = document.createElement('pre');
            code.className = 'stub-snippet';
            code.textContent = this._snippet ?? '';
            this.append(code);
          }
        }
        if (!customElements.get('cv-mfe')) {
          customElements.define('cv-mfe', StubCvMfe);
        }
      `,
      })
  );
}

test.describe('shared-cv-mfe', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await serveStubRemote(page, baseURL);
    await open(page, '/showcase/micro-frontends');
  });

  test('loads the remote and adds its element inside the wrapper', async ({
    page,
  }) => {
    // Arrange
    const wrapper = page.locator('shared-cv-mfe shared-wrapper');

    // Act
    const element = wrapper.locator('cv-mfe');

    // Assert
    await expect(element).toHaveCount(1, { timeout: PAGE_LOAD_TIMEOUT });
    await expect(
      page.evaluate(() => !!customElements.get('cv-mfe'))
    ).resolves.toBe(true);
  });

  test('passes its inputs to the element as properties', async ({ page }) => {
    // Arrange
    const element = page.locator('shared-cv-mfe cv-mfe');
    await expect(element).toHaveCount(1, { timeout: PAGE_LOAD_TIMEOUT });

    // Act
    const snippet = element.locator('.stub-snippet');

    // Assert
    await expect(snippet).toContainText("signal({ role: 'Developer'");
    await expect(snippet).toContainText('computed(');
  });

  test('leaves out inputs that are not set, so the remote keeps its defaults', async ({
    page,
  }) => {
    // Arrange
    const element = page.locator('shared-cv-mfe cv-mfe');
    await expect(element).toHaveCount(1, { timeout: PAGE_LOAD_TIMEOUT });

    // Act
    const own = await element.evaluate((el) => ({
      language: Object.prototype.hasOwnProperty.call(el, 'language'),
      lineNumbers: Object.prototype.hasOwnProperty.call(el, 'lineNumbers'),
      copyable: Object.prototype.hasOwnProperty.call(el, 'copyable'),
    }));

    // Assert
    expect(own).toEqual({
      language: false,
      lineNumbers: false,
      copyable: false,
    });
  });
});

test.describe('shared-cv-mfe without its remote', () => {
  test('keeps the rest of the page working', async ({ page, baseURL }) => {
    // Arrange
    await page.route(remoteEntryOf(baseURL), (route) => route.abort());

    // Act
    await open(page, '/showcase/micro-frontends');

    // Assert
    await expect(page.locator('shared-cv-mfe cv-mfe')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: /Component library/ })
    ).toBeVisible();
  });
});
