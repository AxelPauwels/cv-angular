import { expect, Page, test } from '@playwright/test';
import { openShell } from '../../support/ui';

/** `ds-download-menu` (shared-ui-layout): the cv downloads in the navbar */
const trigger = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Download CV CV' });

test.describe('ds-download-menu', () => {
  test.beforeEach(async ({ page }) => {
    await openShell(page);
  });

  test('names its button after the label and the visible hint', async ({
    page,
  }) => {
    // Arrange
    const button = trigger(page);

    // Act
    const hint = button.locator('.download-menu__label');

    // Assert
    await expect(button).toBeVisible();
    await expect(hint).toHaveText('CV');
  });

  test('lists a download per language', async ({ page }) => {
    // Arrange
    const button = trigger(page);

    // Act
    await button.click();
    const options = page.getByRole('menu').getByRole('menuitem');

    // Assert
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveAccessibleName('English (CV)');
    await expect(options.nth(0)).toHaveAttribute('hreflang', 'en');
    await expect(options.nth(1)).toHaveAccessibleName('Dutch (CV)');
    await expect(options.nth(1)).toHaveAttribute('hreflang', 'nl');
  });

  test('links each option to a pdf that downloads under its own name', async ({
    page,
    request,
  }) => {
    // Arrange
    await trigger(page).click();
    const english = page.getByRole('menuitem', { name: 'English (CV)' });

    // Act
    const href = await english.getAttribute('href');
    const response = await request.get(href ?? '');

    // Assert
    await expect(english).toHaveAttribute(
      'download',
      'Axel-Pauwels_CV_Senior-Angular-Developer_EN.pdf'
    );
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('pdf');
  });

  test('opens with the keyboard and closes with Escape', async ({ page }) => {
    // Arrange
    const button = trigger(page);
    await button.focus();

    // Act
    await page.keyboard.press('Enter');
    // mat-menu focuses its first item after the next render, not when it shows:
    // an earlier Escape closes the menu, then that late focus lands in the
    // leaving panel and is lost instead of going back to the button
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Escape');

    // Assert
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(button).toBeFocused();
  });
});
