import { expect, Page, test } from '@playwright/test';
import { openShell, PHONE } from '../../support/ui';

/** `ds-main-navbar` (shared-ui-layout): the domain tabs in the app header */
const mainNav = (page: Page) =>
  page.getByRole('banner').getByRole('tablist', { name: 'Main navigation' });

const tab = (page: Page, name: string) =>
  mainNav(page).getByRole('tab', { name, exact: true });

test.describe('ds-main-navbar', () => {
  test.beforeEach(async ({ page }) => {
    await openShell(page, '/cv/personal');
  });

  test('shows a tab per domain, home as an icon named by its label', async ({
    page,
  }) => {
    // Arrange
    const nav = mainNav(page);

    // Act
    const tabs = nav.getByRole('tab');

    // Assert
    await expect(tabs).toHaveCount(4);
    await expect(tab(page, 'Home')).toHaveAttribute('href', '/home');
    await expect(tab(page, 'Home').locator('mat-icon')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(tab(page, 'CV')).toHaveAttribute('href', '/cv');
    await expect(tab(page, 'TECHNICAL')).toHaveAttribute('href', '/technical');
    await expect(tab(page, 'SHOWCASE')).toHaveAttribute('href', '/showcase');
  });

  test('selects the tab of the current domain', async ({ page }) => {
    // Arrange
    const cv = tab(page, 'CV');

    // Act
    const showcase = tab(page, 'SHOWCASE');

    // Assert
    await expect(cv).toHaveAttribute('aria-selected', 'true');
    await expect(showcase).toHaveAttribute('aria-selected', 'false');
  });

  test('labels the content area with the selected tab', async ({ page }) => {
    // Arrange
    const panel = page.getByRole('tabpanel', { name: 'CV', exact: true });

    // Act
    const main = panel.getByRole('main');

    // Assert
    await expect(main).toBeVisible();
  });

  test('navigates to a domain and selects its tab', async ({ page }) => {
    // Arrange
    const showcase = tab(page, 'SHOWCASE');

    // Act
    await showcase.click();

    // Assert
    await expect(page).toHaveURL(/\/showcase\//);
    await expect(showcase).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'CV')).toHaveAttribute('aria-selected', 'false');
  });

  test('shows the label of an icon tab as tooltip', async ({ page }) => {
    // Arrange
    const home = tab(page, 'Home');

    // Act
    await home.hover();

    // Assert
    await expect(page.locator('.mat-mdc-tooltip')).toHaveText('Home');
  });

  test('follows a tab with the keyboard', async ({ page }) => {
    // Arrange
    const technical = tab(page, 'TECHNICAL');

    // Act
    await technical.focus();
    await page.keyboard.press('Enter');

    // Assert
    await expect(page).toHaveURL(/\/technical\//);
    await expect(technical).toHaveAttribute('aria-selected', 'true');
  });

  test.describe('on a phone', () => {
    test.use({ viewport: PHONE });

    test('hides the tabs: the mobile menu takes their place', async ({
      page,
    }) => {
      // Arrange
      const tabs = page.locator('ds-main-navbar .main-navbar__tabs');

      // Act
      const menuButton = page.getByRole('button', { name: 'Menu' });

      // Assert
      await expect(tabs).toBeHidden();
      await expect(menuButton).toBeVisible();
    });
  });
});
