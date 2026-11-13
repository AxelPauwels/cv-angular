import { expect, Page, test } from '@playwright/test';
import { open, PHONE } from '../../support/ui';

/** `ds-nav-accordion` (shared-ui-layout): the whole navigation in the mobile menu */
const accordion = (page: Page) =>
  page
    .locator('.mobile-menu__panel')
    .getByRole('navigation', { name: 'Main navigation' });

const domainButton = (page: Page, name: string) =>
  accordion(page).getByRole('button', { name, exact: true });

test.describe('ds-nav-accordion', () => {
  test.use({ viewport: PHONE });

  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/education');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Menu' })
      .click();
    await expect(accordion(page)).toBeVisible();
  });

  test('shows home as a link and every other domain as a toggle', async ({
    page,
  }) => {
    // Arrange
    const nav = accordion(page);

    // Act
    const home = nav.getByRole('link', { name: 'Home' });

    // Assert
    await expect(home).toHaveAttribute('href', '/home');
    await expect(domainButton(page, 'CV')).toBeVisible();
    await expect(domainButton(page, 'Technical')).toBeVisible();
    await expect(domainButton(page, 'Showcase')).toBeVisible();
  });

  test('opens the domain of the current url, with its pages', async ({
    page,
  }) => {
    // Arrange
    const cv = domainButton(page, 'CV');

    // Act
    const pages = accordion(page).locator(
      `#${await cv.getAttribute('aria-controls')}`
    );

    // Assert
    await expect(cv).toHaveAttribute('aria-expanded', 'true');
    await expect(domainButton(page, 'Technical')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(pages.getByRole('link')).toHaveText([
      'Personal',
      'Education',
      'Experience',
      'Skills',
      'References',
    ]);
  });

  test('marks the link of the current page', async ({ page }) => {
    // Arrange
    const nav = accordion(page);

    // Act
    const education = nav.getByRole('link', { name: 'Education' });

    // Assert
    await expect(education).toHaveAttribute('aria-current', 'page');
    await expect(
      nav.getByRole('link', { name: 'Personal' })
    ).not.toHaveAttribute('aria-current', 'page');
  });

  test('keeps one domain open at a time', async ({ page }) => {
    // Arrange
    const technical = domainButton(page, 'Technical');

    // Act
    await technical.click();

    // Assert
    await expect(technical).toHaveAttribute('aria-expanded', 'true');
    await expect(domainButton(page, 'CV')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(
      accordion(page).getByRole('link', { name: 'Versions' })
    ).toBeVisible();
    await expect(
      accordion(page).getByRole('link', { name: 'Personal' })
    ).toBeHidden();
  });

  test('closes an open domain with its own toggle', async ({ page }) => {
    // Arrange
    const cv = domainButton(page, 'CV');

    // Act
    await cv.click();

    // Assert
    await expect(cv).toHaveAttribute('aria-expanded', 'false');
    await expect(
      accordion(page).getByRole('link', { name: 'Education' })
    ).toBeHidden();
  });

  test('opens a domain and follows a page with the keyboard', async ({
    page,
  }) => {
    // Arrange
    const showcase = domainButton(page, 'Showcase');
    await showcase.focus();

    // Act
    await page.keyboard.press('Enter');
    await accordion(page)
      .getByRole('link', { name: 'Micro-frontends' })
      .focus();
    await page.keyboard.press('Enter');

    // Assert
    await expect(page).toHaveURL(/\/showcase\/micro-frontends$/);
  });
});
