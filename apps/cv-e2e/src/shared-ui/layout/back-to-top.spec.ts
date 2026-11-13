import { expect, Page, test } from '@playwright/test';
import { open, PHONE } from '../../support/ui';

/** `ds-back-to-top` (shared-ui-layout): the floating button on phones */
const button = (page: Page) => page.locator('ds-back-to-top button');

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

test.describe('ds-back-to-top', () => {
  test.use({ viewport: PHONE });

  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/experience');
    // a long page: wait for its content, not only its title
    await expect(page.locator('ds-timeline').first()).toBeVisible();
  });

  test('stays hidden, and out of the tab order, near the top', async ({
    page,
  }) => {
    // Arrange
    const backToTop = button(page);

    // Act
    const visibility = await backToTop.evaluate(
      (el) => getComputedStyle(el).visibility
    );

    // Assert
    await expect(backToTop).toHaveAttribute('aria-label', 'Back to top');
    await expect(backToTop).not.toHaveClass(/back-to-top__button--visible/);
    expect(visibility).toBe('hidden');
    await expect(backToTop).toBeHidden();
  });

  test('shows once the page is scrolled down', async ({ page }) => {
    // Arrange
    const backToTop = button(page);

    // Act
    await page.mouse.wheel(0, 2000);

    // Assert
    await expect(backToTop).toBeVisible();
    await expect(backToTop).toHaveClass(/back-to-top__button--visible/);
  });

  test('scrolls back to the top and hides again', async ({ page }) => {
    // Arrange
    await page.mouse.wheel(0, 2000);
    await expect(button(page)).toBeVisible();

    // Act
    await button(page).click();

    // Assert
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(button(page)).toBeHidden();
  });

  test('moves the focus to the header when used from the keyboard', async ({
    page,
  }) => {
    // Arrange
    await page.mouse.wheel(0, 2000);
    await expect(button(page)).toBeVisible();
    await button(page).focus();

    // Act
    await page.keyboard.press('Enter');

    // Assert
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page.getByRole('banner')).toBeFocused();
  });

  test('is not shown on wider screens', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1280, height: 800 });

    // Act
    const host = page.locator('ds-back-to-top');

    // Assert
    await expect(host.locator('button')).toBeHidden();
  });
});
