import { expect, Page, test } from '@playwright/test';
import { open, PAGE_LOAD_TIMEOUT } from '../support/ui';

/** `ds-lordicon` (shared-ui-lordicon): the animated icons of the contact links in the footer */
const icons = (page: Page) => page.locator('footer ds-lordicon');

test.describe('ds-lordicon', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/personal');
    // the contact links load once the footer is in view
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(icons(page).first()).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT,
    });
  });

  test('is decorative: the link around it carries the name', async ({
    page,
  }) => {
    // Arrange
    const contact = page.getByRole('list', { name: "Let's talk" });

    // Act
    const link = contact.getByRole('link', { name: 'Contact', exact: true });

    // Assert
    await expect(link.locator('ds-lordicon')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(icons(page)).toHaveCount(3);
  });

  test('loads the icons from this site, not from the Lordicon CDN', async ({
    page,
    request,
  }) => {
    // Arrange
    const players = icons(page).locator('lord-icon');

    // Act
    const sources = await players.evaluateAll((elements) =>
      elements.map((el) => el.getAttribute('src') ?? '')
    );

    // Assert
    expect(sources).toHaveLength(3);
    for (const src of sources) {
      expect(src).toMatch(/^assets\/lordicon\/\w+\.json$/);
      const response = await request.get(`/${src}`);
      expect(response.ok(), src).toBe(true);
    }
  });

  test('defines the player element once it renders', async ({ page }) => {
    // Arrange
    const defined = () =>
      page.evaluate(() => !!customElements.get('lord-icon'));

    // Act
    await expect.poll(defined).toBe(true);

    // Assert
    await expect(icons(page).locator('lord-icon').first()).toHaveAttribute(
      'trigger',
      'hover'
    );
    await expect(icons(page).locator('lord-icon').first()).toHaveAttribute(
      'target',
      'a, button'
    );
  });

  test('keeps the static icon as placeholder inside the player', async ({
    page,
  }) => {
    // Arrange
    const link = page
      .getByRole('list', { name: "Let's talk" })
      .getByRole('link', { name: 'Contact', exact: true });

    // Act
    const placeholder = link.locator('lord-icon .cv-icon');

    // Assert
    await expect(placeholder).toHaveCount(1);
    await expect(placeholder).toHaveClass(/cv-icon-mail/);
  });
});
