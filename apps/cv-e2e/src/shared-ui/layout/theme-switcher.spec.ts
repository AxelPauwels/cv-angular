import { expect, Page, test } from '@playwright/test';
import { html, openShell } from '../../support/ui';

/** `ds-theme-switcher` (shared-ui-layout): the color theme menu in the navbar */
const trigger = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Theme' });

const option = (page: Page, name: string) =>
  page.getByRole('menu').getByRole('menuitemradio', { name });

test.describe('ds-theme-switcher', () => {
  test.beforeEach(async ({ page }) => {
    await openShell(page);
  });

  test('lists every theme and checks the active one', async ({ page }) => {
    // Arrange
    const button = trigger(page);

    // Act
    await button.click();
    const options = page.getByRole('menu').getByRole('menuitemradio');

    // Assert
    await expect(options).toHaveCount(13);
    await expect(option(page, 'Gold')).toHaveAttribute('aria-checked', 'true');
    await expect(option(page, 'Peach')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    await expect(html(page)).toHaveAttribute('data-theme', 'gold');
  });

  test('separates the groups of themes with dividers', async ({ page }) => {
    // Arrange
    await trigger(page).click();

    // Act
    const dividers = page.locator('.theme-switcher__menu mat-divider');

    // Assert: color | element | metal | reset
    await expect(dividers).toHaveCount(3);
  });

  test('switches the theme and remembers it', async ({ page }) => {
    // Arrange
    await trigger(page).click();

    // Act
    await option(page, 'Peach').click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-theme', 'peach');
    await page.reload();
    await expect(html(page)).toHaveAttribute('data-theme', 'peach');
    await trigger(page).click();
    await expect(option(page, 'Peach')).toHaveAttribute('aria-checked', 'true');
  });

  test('resets to the default theme', async ({ page }) => {
    // Arrange
    await trigger(page).click();
    await option(page, 'Peach').click();
    await trigger(page).click();

    // Act
    await page.getByRole('menuitem', { name: 'Reset' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-theme', 'gold');
  });

  test('can be used with the keyboard', async ({ page }) => {
    // Arrange
    await trigger(page).focus();

    // Act
    await page.keyboard.press('Enter');
    // mat-menu focuses its first item after the next render, not when it shows:
    // wait for that focus, or ArrowDown would only activate the first item
    await expect(option(page, 'Peach')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'Tangerine')).toBeFocused();
    await page.keyboard.press('Enter');

    // Assert: the first item had the focus, so the second one is chosen
    await expect(html(page)).toHaveAttribute('data-theme', 'tangerine');
    await expect(page.getByRole('menu')).toBeHidden();
  });
});
