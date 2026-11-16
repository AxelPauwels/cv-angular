import { expect, Page, test } from '@playwright/test';
import { html, open, PAGE_LOAD_TIMEOUT } from '../../support/ui';

/** `ds-language-switcher` (shared-ui-layout): the language menu in the navbar */
const switcher = (page: Page) =>
  page.getByRole('banner').locator('ds-language-switcher button');

const option = (page: Page, name: string) =>
  page.getByRole('menu').getByRole('menuitemradio', { name });

test.describe('ds-language-switcher', () => {
  test.use({ locale: 'en-US' });

  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/personal');
  });

  test('lists every language, each marked with its language code', async ({
    page,
  }) => {
    // Arrange
    const button = switcher(page);

    // Act
    await button.click();
    const options = page.getByRole('menu').getByRole('menuitemradio');

    // Assert
    await expect(button).toHaveAccessibleName('Language');
    await expect(options).toHaveCount(4);
    for (const [index, [name, lang]] of [
      ['English', 'en'],
      ['Dutch', 'nl'],
      ['French', 'fr'],
      ['Spanish', 'es'],
    ].entries()) {
      await expect(options.nth(index)).toHaveAccessibleName(name);
      await expect(options.nth(index)).toHaveAttribute('lang', lang);
    }
    await expect(option(page, 'English')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  test('translates the app and sets the page language', async ({ page }) => {
    // Arrange
    await switcher(page).click();

    // Act
    await option(page, 'Dutch').click();

    // Assert
    await expect(html(page)).toHaveAttribute('lang', 'nl');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /persoonlijk/i
    );
    await expect(
      page.getByRole('banner').getByRole('tablist', { name: 'Hoofdnavigatie' })
    ).toBeVisible();
  });

  test('remembers the language', async ({ page }) => {
    // Arrange
    await switcher(page).click();
    await option(page, 'Dutch').click();
    await expect(html(page)).toHaveAttribute('lang', 'nl');

    // Act
    await page.reload();

    // Assert
    await expect(html(page)).toHaveAttribute('lang', 'nl');
    await expect(switcher(page)).toHaveAccessibleName('Taal', {
      timeout: PAGE_LOAD_TIMEOUT,
    });
  });

  test('resets to the browser language', async ({ page }) => {
    // Arrange
    await switcher(page).click();
    await option(page, 'Dutch').click();
    await expect(html(page)).toHaveAttribute('lang', 'nl');
    await switcher(page).click();

    // Act
    await page.getByRole('menuitem', { name: 'Reset' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('lang', 'en');
    await expect(switcher(page)).toHaveAccessibleName('Language');
  });
});
