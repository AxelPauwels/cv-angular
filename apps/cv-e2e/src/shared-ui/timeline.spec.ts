import { expect, Locator, Page, test } from '@playwright/test';
import { open } from '../support/ui';

/**
 * `ds-timeline`, `ds-timeline-item`, `ds-timeline-divider` and
 * `ds-timeline-detail` (shared-ui-timeline)
 */
const timeline = (page: Page, name: string) =>
  page.getByRole('list', { name, exact: true });

const steps = (list: Locator) => list.locator(':scope > li');

test.describe('ds-timeline', () => {
  test.describe('on the experience page', () => {
    test.beforeEach(async ({ page }) => {
      await open(page, '/cv/experience');
      await expect(timeline(page, 'IT')).toBeVisible();
    });

    test('lists the steps in an ordered list named by its label', async ({
      page,
    }) => {
      // Arrange
      const it = timeline(page, 'IT');

      // Act
      const tagName = await it.evaluate((el) => el.tagName);

      // Assert
      expect(tagName).toBe('OL');
      expect(await steps(it).count()).toBeGreaterThan(1);
    });

    test('puts each step header in a heading, with a toggle button', async ({
      page,
    }) => {
      // Arrange
      const first = steps(timeline(page, 'IT')).first();

      // Act
      const heading = first.getByRole('heading', { level: 3 });

      // Assert
      await expect(heading.getByRole('button')).toBeVisible();
      await expect(heading.locator('.timeline__year')).toHaveText(/^\d{4}$/);
    });

    test('opens only the first step', async ({ page }) => {
      // Arrange
      const it = steps(timeline(page, 'IT'));

      // Act
      const first = it.nth(0).getByRole('button');
      const second = it.nth(1).getByRole('button');

      // Assert
      await expect(first).toHaveAttribute('aria-expanded', 'true');
      await expect(second).toHaveAttribute('aria-expanded', 'false');
      await expect(it.nth(0).getByRole('region')).toBeVisible();
    });

    test('names each step region after its header', async ({ page }) => {
      // Arrange
      const first = steps(timeline(page, 'IT')).first();
      const button = first.getByRole('button');

      // Act
      const region = page.locator(
        `#${await button.getAttribute('aria-controls')}`
      );

      // Assert
      await expect(region).toHaveRole('region');
      await expect(region).toHaveAccessibleName(
        (await button.textContent())?.trim().replace(/\s+/g, ' ') ?? ''
      );
    });

    test('toggles a step, and keeps a closed one out of reach', async ({
      page,
    }) => {
      // Arrange
      const second = steps(timeline(page, 'IT')).nth(1);
      const button = second.getByRole('button');
      const content = second.locator('.timeline__content');
      await expect(content).toHaveAttribute('inert', '');

      // Act
      await button.click();

      // Assert
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(content).not.toHaveAttribute('inert');
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(content).toHaveAttribute('inert', '');
    });

    test('toggles with the keyboard', async ({ page }) => {
      // Arrange
      const button = steps(timeline(page, 'IT')).nth(1).getByRole('button');
      await button.focus();

      // Act
      await page.keyboard.press('Enter');

      // Assert
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Space');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    test('shows the period of an open step', async ({ page }) => {
      // Arrange
      const first = steps(timeline(page, 'IT')).first();

      // Act
      const period = first.locator('.timeline-item__detail').first();

      // Assert
      await expect(period).toHaveText(
        /^\s*calendar_month\s*\d{4}( – \d{4})?\s*$/
      );
    });

    test('gives a step without content a plain header, no button', async ({
      page,
    }) => {
      // Arrange
      const hospitality = steps(timeline(page, 'Hospitality')).first();

      // Act
      const button = hospitality.getByRole('button');

      // Assert
      await expect(button).toHaveCount(0);
      await expect(
        hospitality.getByRole('heading', { level: 3 })
      ).toBeVisible();
    });

    test('shows a tag next to the title', async ({ page }) => {
      // Arrange
      const it = timeline(page, 'IT');

      // Act
      const tag = it.locator('.timeline-item__tag').first();

      // Assert
      await expect(tag).toHaveText('Internship');
    });

    test('separates two timelines with a divider heading', async ({ page }) => {
      // Arrange
      const divider = page.locator('ds-timeline-divider');

      // Act
      const heading = divider.getByRole('heading', { level: 2 });

      // Assert
      await expect(heading).toHaveText('Hospitality');
    });

    test('shows details as extra rows, each with its own icon', async ({
      page,
    }) => {
      // Arrange
      const first = steps(timeline(page, 'IT')).first();

      // Act
      const details = first.locator('ds-timeline-detail');

      // Assert
      expect(await details.count()).toBeGreaterThan(0);
      await expect(
        details.first().locator('.timeline-detail__icon')
      ).toHaveAttribute('aria-hidden', 'true');
      await expect(
        first
          .locator('ds-timeline-detail')
          .filter({ has: page.getByRole('list') })
      ).toContainText('Angular');
    });
  });

  test.describe('on the education page', () => {
    test.beforeEach(async ({ page }) => {
      await open(page, '/cv/education');
      await expect(timeline(page, 'Hospitality')).toBeVisible();
    });

    test('keeps the first step closed when asked to', async ({ page }) => {
      // Arrange
      const hotelschool = steps(timeline(page, 'Hospitality')).first();

      // Act
      const button = hotelschool.getByRole('button', { name: /Hotelschool/ });

      // Assert
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    test('nests an always-open timeline, without toggles, in a step', async ({
      page,
    }) => {
      // Arrange
      await steps(timeline(page, 'Hospitality'))
        .first()
        .getByRole('button', { name: /Hotelschool/ })
        .click();

      // Act
      const nested = timeline(page, 'Hotelschool');

      // Assert
      await expect(nested).toBeVisible();
      await expect(
        nested.getByRole('heading', { level: 4 }).first()
      ).toBeVisible();
      await expect(nested.getByRole('button')).toHaveCount(0);
      for (const region of await nested.getByRole('region').all()) {
        await expect(region).toBeVisible();
      }
    });
  });
});
