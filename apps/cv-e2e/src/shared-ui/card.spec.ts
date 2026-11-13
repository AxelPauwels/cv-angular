import { expect, Page, test } from '@playwright/test';
import { boxOf, open } from '../support/ui';

/** `ds-card` (shared-ui-card), with its `dsCardActions` slot */
const card = (page: Page, title: string | RegExp) =>
  page.locator('ds-card').filter({
    has: page.getByRole('heading', { name: title }),
  });

test.describe('ds-card', () => {
  test.describe('on the personal page', () => {
    test.beforeEach(async ({ page }) => {
      await open(page, '/cv/personal');
      await expect(page.locator('ds-card').first()).toBeVisible();
    });

    test('titles a card with a heading of the given level', async ({
      page,
    }) => {
      // Arrange
      const english = card(page, 'English');

      // Act
      const heading = english.getByRole('heading', { level: 3 });

      // Assert
      await expect(heading).toHaveText('English');
    });

    test('reads a tag as part of the title, separated by a space', async ({
      page,
    }) => {
      // Arrange
      const dutch = card(page, /Dutch/);

      // Act
      const heading = dutch.getByRole('heading', { level: 3 });

      // Assert
      await expect(heading).toHaveAccessibleName('Dutch Native');
      await expect(heading.locator('.card__tag')).toHaveText('Native');
    });

    test('shows a subtitle under the title', async ({ page }) => {
      // Arrange
      const wca = card(page, 'Member of WCA');

      // Act
      const subtitle = wca.locator('.card__subtitle');

      // Assert
      await expect(subtitle).toHaveText('World Cube Association');
    });

    test('gives a brand card the header colors', async ({ page }) => {
      // Arrange
      const brand = card(page, 'Board games').locator('mat-card');
      const regular = card(page, 'English').locator('mat-card');

      // Act
      const brandColor = await brand.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );

      // Assert
      await expect(brand).toHaveClass(/card--brand/);
      await expect(regular).not.toHaveClass(/card--brand/);
      await expect(regular).not.toHaveCSS('background-color', brandColor);
    });

    test('leaves out the actions row without actions', async ({ page }) => {
      // Arrange
      const english = card(page, 'English');

      // Act
      const actions = english.locator('mat-card-actions');

      // Assert
      await expect(actions).toHaveCount(0);
    });
  });

  test.describe('on the references page', () => {
    test('shows initials as a decorative avatar', async ({ page }) => {
      // Arrange
      await open(page, '/cv/references');

      // Act
      const avatar = card(page, 'Kevin Jannis').locator(
        '.card__icon--initials'
      );

      // Assert
      await expect(avatar).toHaveText('KJ');
      await expect(avatar).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('on the micro-frontends page', () => {
    test.beforeEach(async ({ page }) => {
      await open(page, '/showcase/micro-frontends');
    });

    test('shows a Material icon as avatar, hidden from screen readers', async ({
      page,
    }) => {
      // Arrange
      const lib = card(page, /Component library/);

      // Act
      const icon = lib.locator('mat-icon.card__icon');

      // Assert
      await expect(icon).toHaveText('package_2');
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('puts the actions at the bottom right of the card', async ({
      page,
    }) => {
      // Arrange
      const lib = card(page, /Component library/);
      const frame = await boxOf(lib.locator('mat-card'));

      // Act: the content marked dsCardActions
      const action = await boxOf(lib.locator('[dsCardActions]'));

      // Assert
      expect(action.y + action.height).toBeGreaterThan(
        frame.y + frame.height - 40
      );
      expect(action.x + action.width).toBeGreaterThan(
        frame.x + frame.width - 40
      );
    });
  });
});
