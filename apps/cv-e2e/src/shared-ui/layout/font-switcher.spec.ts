import { expect, Page, test } from '@playwright/test';
import { html, openShell } from '../../support/ui';

/** `ds-font-switcher` (shared-ui-layout): the font menu in the navbar */
const trigger = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Font' });

const option = (page: Page, name: string) =>
  page.getByRole('menu').getByRole('menuitemradio', { name });

test.describe('ds-font-switcher', () => {
  test.beforeEach(async ({ page }) => {
    await openShell(page);
  });

  test('lists every font, each label in its own font', async ({ page }) => {
    // Arrange
    await trigger(page).click();

    // Act
    const options = page.getByRole('menu').getByRole('menuitemradio');

    // Assert
    await expect(options).toHaveText([
      /Red Hat/,
      /Roboto/,
      /Inter/,
      /IBM Plex/,
      /Atkinson/,
      /Open Sans/,
      /Nunito/,
      /Source Serif/,
      /Lexend/,
      /Manrope/,
    ]);
    await expect(
      option(page, 'Inter').locator('.font-switcher__label')
    ).toHaveAttribute('data-font', 'inter');
    await expect(option(page, 'Red Hat')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  test('switches the font and remembers it', async ({ page }) => {
    // Arrange
    await trigger(page).click();

    // Act
    await option(page, 'Inter').click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-font', 'inter');
    await page.reload();
    await expect(html(page)).toHaveAttribute('data-font', 'inter');
  });

  test('resets to the default font', async ({ page }) => {
    // Arrange
    await trigger(page).click();
    await option(page, 'Roboto').click();
    await trigger(page).click();

    // Act
    await page.getByRole('menuitem', { name: 'Reset' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-font', 'red-hat');
  });
});
