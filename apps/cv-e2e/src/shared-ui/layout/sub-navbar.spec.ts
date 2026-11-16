import { expect, Page, test } from '@playwright/test';
import { open } from '../../support/ui';

/** `ds-sub-navbar` (shared-ui-layout): a domain's page tabs and the scrolling panel below them */
const subNav = (page: Page) =>
  page.getByRole('main').getByRole('tablist', { name: 'CV navigation' });

const panelOf = (page: Page) =>
  page.locator('ds-sub-navbar .sub-navbar__panel');

test.describe('ds-sub-navbar', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/personal');
  });

  test('shows a tab per page of the domain', async ({ page }) => {
    // Arrange
    const nav = subNav(page);

    // Act
    const tabs = nav.getByRole('tab');

    // Assert
    await expect(tabs).toHaveText([
      'Personal',
      'Education',
      'Experience',
      'Skills',
      'References',
    ]);
  });

  test('selects the tab of the current page and names the panel after it', async ({
    page,
  }) => {
    // Arrange
    const personal = subNav(page).getByRole('tab', { name: 'Personal' });

    // Act
    const panel = page.getByRole('tabpanel', { name: 'Personal' });

    // Assert
    await expect(personal).toHaveAttribute('aria-selected', 'true');
    await expect(panel.getByRole('heading', { level: 1 })).toHaveText(
      /personal/i
    );
  });

  test('navigates between the pages of the domain', async ({ page }) => {
    // Arrange
    const skills = subNav(page).getByRole('tab', { name: 'Skills' });

    // Act
    await skills.click();

    // Assert
    await expect(page).toHaveURL(/\/cv\/skills$/);
    await expect(skills).toHaveAttribute('aria-selected', 'true');
    await expect(
      subNav(page).getByRole('tab', { name: 'Personal' })
    ).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('tabpanel', { name: 'Skills' })).toBeVisible();
  });

  test('makes the panel a tab stop, so keyboard users can scroll it', async ({
    page,
  }) => {
    // Arrange
    const panel = panelOf(page);

    // Act
    await panel.focus();

    // Assert
    await expect(panel).toHaveAttribute('tabindex', '0');
    await expect(panel).toBeFocused();
  });

  test('scrolls the panel with End and Home when nothing has the focus', async ({
    page,
  }) => {
    // Arrange
    const panel = panelOf(page);
    await expect(page.locator('ds-card').first()).toBeVisible();
    const scrollTop = () => panel.evaluate((el) => el.scrollTop);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    // Act
    await page.keyboard.press('End');
    await expect.poll(scrollTop).toBeGreaterThan(0);
    await page.keyboard.press('Home');

    // Assert
    await expect.poll(scrollTop).toBe(0);
  });
});
