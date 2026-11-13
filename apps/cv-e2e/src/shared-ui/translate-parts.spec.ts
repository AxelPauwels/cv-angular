import { expect, Page, test } from '@playwright/test';
import { html, open } from '../support/ui';

/**
 * The `translateParts` pipe (shared-ui-i18n): translations with inline
 * `<code>` render real elements, without innerHTML
 */
const mfeSteps = (page: Page) =>
  page
    .locator('ds-card')
    .filter({ has: page.getByRole('heading', { name: /Micro-frontend:/ }) })
    .locator('ol')
    .first();

test.describe('translateParts', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, '/showcase/micro-frontends');
  });

  test('renders the marked parts as <code> elements', async ({ page }) => {
    // Arrange
    const steps = mfeSteps(page);

    // Act
    const code = steps.locator('li').first().locator('code');

    // Assert
    await expect(code).toHaveText([
      'initFederation()',
      'federation.manifest.json',
      'cv-mfe',
      'remoteEntry.json',
    ]);
  });

  test('keeps the text around them, and shows no tags as text', async ({
    page,
  }) => {
    // Arrange
    const first = mfeSteps(page).locator('li').first();

    // Act
    const text = await first.innerText();

    // Assert
    expect(text).toMatch(/^At startup, initFederation\(\) reads /);
    expect(text).not.toContain('<code>');
  });

  test('escapes markup inside a part', async ({ page }) => {
    // Arrange
    const register = mfeSteps(page).locator('li').nth(2);

    // Act
    const code = register.locator('code');

    // Assert: <cv-mfe> stays text, not an element
    await expect(code).toHaveText('<cv-mfe>');
    await expect(code.locator('cv-mfe')).toHaveCount(0);
  });

  test('follows a change of language', async ({ page }) => {
    // Arrange
    const first = mfeSteps(page).locator('li').first();
    const english = await first.innerText();

    // Act
    await page
      .getByRole('banner')
      .locator('ds-language-switcher button')
      .click();
    await page.getByRole('menuitemradio', { name: 'Dutch' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('lang', 'nl');
    await expect.poll(() => first.innerText()).not.toBe(english);
    await expect(first.locator('code').first()).toHaveText('initFederation()');
  });
});
