import { expect, Page, test } from '@playwright/test';
import { interceptCvApi, PAGE_LOAD_TIMEOUT } from '../support/ui';

/**
 * `ds-loading-spinner` (shared-ui-loading-spinner) and `ds-store-loading-error`
 * (shared-ui-store-loading-error): what a cv page shows while its data loads,
 * and when it fails. The data is held back at the in-browser GraphQL api.
 */
const title = (page: Page) => page.getByRole('heading', { level: 1 });

test.describe('ds-loading-spinner', () => {
  test('shows while the data loads, then makes way for it', async ({
    page,
  }) => {
    // Arrange
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => (release = resolve));
    await interceptCvApi(page, async (route, body) => {
      await released;
      await route.fulfill({ body, contentType: 'text/javascript' });
    });

    // Act
    await page.goto('/cv/skills');
    const spinner = page.getByRole('progressbar', { name: 'Loading' });

    // Assert
    await expect(title(page)).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    await expect(spinner).toBeVisible();
    await expect(page.locator('ds-loading-spinner')).toHaveCount(1);
    release();
    await expect(spinner).toBeHidden({ timeout: PAGE_LOAD_TIMEOUT });
    await expect(page.locator('ds-card').first()).toBeVisible();
  });

  test('shows nothing for a fast load', async ({ page }) => {
    // Arrange
    const spinners: number[] = [];
    await page.exposeFunction('spinnerSeen', () => spinners.push(Date.now()));
    await page.addInitScript(() => {
      new MutationObserver(() => {
        if (document.querySelector('ds-loading-spinner')) {
          (window as unknown as { spinnerSeen: () => void }).spinnerSeen();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    // the api chunk once loaded, so the next page's data comes at once
    await page.goto('/cv/personal');
    await expect(page.locator('ds-card').first()).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT,
    });
    spinners.length = 0;

    // Act
    await page.getByRole('main').getByRole('tab', { name: 'Skills' }).click();

    // Assert
    await expect(page.locator('ds-card').first()).toBeVisible();
    expect(spinners).toEqual([]);
  });
});

test.describe('ds-store-loading-error', () => {
  test.beforeEach(async ({ page }) => {
    await interceptCvApi(page, (route) => route.abort());
  });

  test('replaces the content with an alert when the data fails', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/cv/skills');

    // Act
    const alert = page.getByRole('main').getByRole('alert');

    // Assert
    await expect(alert).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    await expect(alert).toContainText('Could not load skills:');
    await expect(page.locator('ds-card')).toHaveCount(0);
    await expect(page.locator('ds-loading-spinner')).toHaveCount(0);
  });

  test('hides its icon from screen readers', async ({ page }) => {
    // Arrange
    await page.goto('/cv/experience');

    // Act
    const icon = page.locator('ds-store-loading-error mat-icon');

    // Assert
    await expect(icon).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('uses the error color of the theme', async ({ page }) => {
    // Arrange
    await page.goto('/cv/education');
    const alert = page.locator('ds-store-loading-error');
    await expect(alert).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });

    // Act
    const [color, error] = await alert.evaluate((el) => [
      getComputedStyle(el).color,
      getComputedStyle(el).getPropertyValue('--mat-sys-error').trim(),
    ]);

    // Assert
    expect(error).not.toBe('');
    expect(color).not.toBe(
      await page.evaluate(() => getComputedStyle(document.body).color)
    );
  });
});
