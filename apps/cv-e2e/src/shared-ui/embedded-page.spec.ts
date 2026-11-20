import { expect, Page, test } from '@playwright/test';
import { open, PAGE_LOAD_TIMEOUT } from '../support/ui';

/**
 * `ds-embedded-page` (shared-ui-embedded-page): a report of this site in an
 * iframe. The reports only exist after a production build, so each test serves
 * its own version of the coverage report.
 */
const REPORT = '/coverage/index.html';
const STUB_REPORT =
  '<!doctype html><html><head><title>Stub</title></head><body><h1>Stub coverage report</h1></body></html>';

const serveReport = (page: Page, body: string) =>
  page.route(`**${REPORT}`, (route) =>
    route.fulfill({ body, contentType: 'text/html' })
  );

const frame = (page: Page) => page.locator('ds-embedded-page iframe');

test.describe('ds-embedded-page', () => {
  test.describe('with the report available', () => {
    test.beforeEach(async ({ page }) => {
      await serveReport(page, STUB_REPORT);
      await open(page, '/technical/code-coverage');
    });

    test('shows the report in an iframe, titled like the page', async ({
      page,
    }) => {
      // Arrange
      const report = frame(page);

      // Act
      const content = page.frameLocator('ds-embedded-page iframe');

      // Assert
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        /code coverage/i
      );
      await expect(report).toHaveAttribute('title', 'code coverage');
      await expect(report).toHaveAttribute('src', REPORT);
      await expect(content.getByRole('heading')).toHaveText(
        'Stub coverage report'
      );
    });

    test('links to the report in a new tab', async ({ page }) => {
      // Arrange
      const actions = page.locator('ds-embedded-page');

      // Act
      const link = actions.getByRole('link', { name: 'Open' });

      // Assert
      await expect(link).toHaveAttribute('href', REPORT);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    });

    test("gives the report the app's font and a transparent background", async ({
      page,
    }) => {
      // Arrange
      const report = page.frameLocator('ds-embedded-page iframe');
      await expect(report.getByRole('heading')).toBeVisible();

      // Act
      const style = report.locator('#cv-embedded-styles');

      // Assert
      await expect(style).toHaveCount(1);
      await expect(report.locator('body')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)'
      );
    });

    test('follows the color scheme of the app into the report', async ({
      page,
    }) => {
      // Arrange
      const root = page.frameLocator('ds-embedded-page iframe').locator('html');
      await expect(root).toHaveAttribute('data-cv-color-scheme', 'light');

      // Act
      await page
        .getByRole('banner')
        .locator('ds-color-scheme-switcher button')
        .click();
      await page.getByRole('menuitemradio', { name: 'Dark mode' }).click();

      // Assert
      await expect(root).toHaveAttribute('data-cv-color-scheme', 'dark');
    });
  });

  test('says so when the report is missing, instead of nesting the app', async ({
    page,
  }) => {
    // Arrange: hosting answers an unknown path with the app's index.html
    await serveReport(
      page,
      '<!doctype html><html><body><app-root></app-root></body></html>'
    );

    // Act
    await open(page, '/technical/code-coverage');
    const message = page.locator('ds-embedded-page p');

    // Assert
    await expect(message).toContainText('This report is not available here.');
    await expect(message.locator('code')).toHaveText(
      'npm run build:production'
    );
    await expect(frame(page)).toHaveCount(0);
  });

  test('shows a progress bar while a slow report loads', async ({ page }) => {
    // Arrange
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => (release = resolve));
    await page.route(`**${REPORT}`, async (route) => {
      await released;
      await route.fulfill({ body: STUB_REPORT, contentType: 'text/html' });
    });

    // Act
    await open(page, '/technical/code-coverage');
    const progress = page.getByRole('progressbar', {
      name: 'Loading the report',
    });

    // Assert
    await expect(progress).toBeVisible();
    release();
    await expect(progress).toBeHidden({ timeout: PAGE_LOAD_TIMEOUT });
    await expect(frame(page)).toBeVisible();
  });
});
