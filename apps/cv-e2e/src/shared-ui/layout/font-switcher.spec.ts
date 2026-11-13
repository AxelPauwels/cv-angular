import { expect, Page, test } from '@playwright/test';
import { html, openShell, setFeatureToggles } from '../../support/ui';

/** `ds-font-switcher` (shared-ui-layout): the font menu in the navbar */
const trigger = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Font' });

const option = (page: Page, name: string) =>
  page.getByRole('menu').getByRole('menuitemradio', { name });

test.describe('ds-font-switcher', () => {
  test('is switched off by default', async ({ page }) => {
    // Arrange
    await openShell(page);

    // Act
    const button = trigger(page);

    // Assert
    await expect(button).toHaveCount(0);
  });

  test.describe('switched on', () => {
    test.beforeEach(async ({ page }) => {
      await setFeatureToggles(page, { 'navbar-font-switcher': true });
      await openShell(page);
    });

    test('lists every font, each label in its own font', async ({ page }) => {
      // Arrange
      await trigger(page).click();

      // Act
      const options = page.getByRole('menu').getByRole('menuitemradio');

      // Assert
      await expect(options).toHaveText([
        /Red Hat Display/,
        /Michroma/,
        /Goldman/,
        /Syncopate/,
        /Bruno Ace SC/,
      ]);
      await expect(
        option(page, 'Michroma').locator('.font-switcher__label')
      ).toHaveAttribute('data-font', 'michroma');
      await expect(option(page, 'Red Hat Display')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    test('switches the font and remembers it', async ({ page }) => {
      // Arrange
      await trigger(page).click();

      // Act
      await option(page, 'Michroma').click();

      // Assert
      await expect(html(page)).toHaveAttribute('data-font', 'michroma');
      await page.reload();
      await expect(html(page)).toHaveAttribute('data-font', 'michroma');
    });

    test('resets to the default font', async ({ page }) => {
      // Arrange
      await trigger(page).click();
      await option(page, 'Goldman').click();
      await trigger(page).click();

      // Act
      await page.getByRole('menuitem', { name: 'Reset' }).click();

      // Assert
      await expect(html(page)).toHaveAttribute('data-font', 'red-hat');
    });
  });
});
