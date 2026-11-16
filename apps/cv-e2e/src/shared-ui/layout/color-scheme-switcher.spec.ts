import { expect, Page, test } from '@playwright/test';
import { html, openShell } from '../../support/ui';

/** `ds-color-scheme-switcher` (shared-ui-layout): light and dark mode in the navbar */
const switcher = (page: Page) =>
  page.getByRole('banner').locator('ds-color-scheme-switcher button');

const option = (page: Page, name: string) =>
  page.getByRole('menu').getByRole('menuitemradio', { name });

test.describe('ds-color-scheme-switcher', () => {
  test.beforeEach(async ({ page }) => {
    await openShell(page);
  });

  test('starts in light mode and names its button after the mode', async ({
    page,
  }) => {
    // Arrange
    const button = switcher(page);

    // Act
    await button.click();

    // Assert
    await expect(button).toHaveAccessibleName('Light mode');
    await expect(html(page)).toHaveAttribute('data-color-scheme', 'light');
    await expect(option(page, 'Light mode')).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(option(page, 'Dark mode')).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  test('switches to dark mode and remembers it', async ({ page }) => {
    // Arrange
    await switcher(page).click();

    // Act
    await option(page, 'Dark mode').click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-color-scheme', 'dark');
    await expect(switcher(page)).toHaveAccessibleName('Dark mode');
    await page.reload();
    await expect(html(page)).toHaveAttribute('data-color-scheme', 'dark');
  });

  test('changes the page colors', async ({ page }) => {
    // Arrange
    const background = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const light = await background();
    await switcher(page).click();

    // Act
    await option(page, 'Dark mode').click();

    // Assert
    await expect.poll(background).not.toBe(light);
  });

  test('resets to light mode', async ({ page }) => {
    // Arrange
    await switcher(page).click();
    await option(page, 'Dark mode').click();
    await switcher(page).click();

    // Act
    await page.getByRole('menuitem', { name: 'Reset' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-color-scheme', 'light');
  });
});
