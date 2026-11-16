import { expect, Page, test } from '@playwright/test';
import { open, PHONE } from '../../support/ui';

/** `ds-mobile-menu` (shared-ui-layout): the hamburger menu on phones */
const menuButton = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Menu' });

const menuPanel = (page: Page) => page.locator('.mobile-menu__panel');

test.describe('ds-mobile-menu', () => {
  test.use({ viewport: PHONE });

  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/personal');
  });

  test('starts closed, and says so', async ({ page }) => {
    // Arrange
    const button = menuButton(page);

    // Act
    const panelId = await menuPanel(page).getAttribute('id');

    // Assert
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', panelId ?? '');
    await expect(menuPanel(page)).toBeHidden();
  });

  test('opens the panel with the navigation', async ({ page }) => {
    // Arrange
    const button = menuButton(page);

    // Act
    await button.click();

    // Assert
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(menuPanel(page)).toBeVisible();
    await expect(
      menuPanel(page).getByRole('navigation', { name: 'Main navigation' })
    ).toBeVisible();
  });

  test('closes again with its own button', async ({ page }) => {
    // Arrange
    const button = menuButton(page);
    await button.click();
    await expect(menuPanel(page)).toBeVisible();

    // Act
    await button.click();

    // Assert
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(menuPanel(page)).toBeHidden();
  });

  test('closes with Escape and gives the focus back to its button', async ({
    page,
  }) => {
    // Arrange
    await menuButton(page).click();
    const firstLink = menuPanel(page).getByRole('link').first();
    await firstLink.focus();

    // Act
    await page.keyboard.press('Escape');

    // Assert
    await expect(menuPanel(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test('closes on a click outside the menu', async ({ page }) => {
    // Arrange
    await menuButton(page).click();
    await expect(menuPanel(page)).toBeVisible();

    // Act: below the panel, which covers the top of the page
    await page.mouse.click(10, PHONE.height - 10);

    // Assert
    await expect(menuPanel(page)).toBeHidden();
  });

  test('closes after a navigation', async ({ page }) => {
    // Arrange
    await menuButton(page).click();
    const skills = menuPanel(page).getByRole('link', { name: 'Skills' });

    // Act
    await skills.click();

    // Assert
    await expect(page).toHaveURL(/\/cv\/skills$/);
    await expect(menuPanel(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('is hidden on wider screens', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1280, height: 800 });

    // Act
    const button = page.locator('ds-mobile-menu');

    // Assert
    await expect(button).toBeHidden();
  });
});
