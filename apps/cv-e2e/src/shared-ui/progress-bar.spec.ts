import { expect, Locator, Page, test } from '@playwright/test';
import { boxOf, open } from '../support/ui';

/** `ds-progress-bar` (shared-ui-progress-bar): the language levels on the personal page */
const bars = (page: Page) => page.locator('ds-progress-bar');

const languageCard = (page: Page, name: string | RegExp) =>
  page.locator('ds-card').filter({ has: page.getByRole('heading', { name }) });

/** How much of its track the first bar in a card fills, from 0 to 1 */
async function filled(card: Locator): Promise<number> {
  const bar = card.locator('ds-progress-bar').first();
  const fill = bar.locator('.progress-bar__fill');
  return (await boxOf(fill)).width / (await boxOf(bar)).width;
}

test.describe('ds-progress-bar', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/personal');
    await expect(bars(page).first()).toBeVisible();
  });

  test('is decorative without a label: hidden from screen readers', async ({
    page,
  }) => {
    // Arrange
    const bar = bars(page).first();

    // Act
    const progressbars = page.getByRole('progressbar');

    // Assert
    await expect(bar).not.toHaveAttribute('role');
    await expect(bar).toHaveAttribute('aria-hidden', 'true');
    await expect(progressbars).toHaveCount(0);
  });

  test('sets the width of the fill as a percentage', async ({ page }) => {
    // Arrange
    const fill = bars(page).first().locator('.progress-bar__fill');

    // Act
    const style = await fill.getAttribute('style');

    // Assert
    expect(style).toMatch(/inline-size:\s*\d{1,3}%/);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('shows the fill at once, without animation', async ({ page }) => {
      // Arrange
      const fill = bars(page).first().locator('.progress-bar__fill');

      // Act
      const animation = await fill.evaluate(
        (el) => getComputedStyle(el).animationName
      );

      // Assert
      expect(animation).toBe('none');
    });

    test('fills to its value', async ({ page }) => {
      // Arrange
      const dutch = languageCard(page, /Dutch/);
      const french = languageCard(page, 'French');

      // Act
      const excellent = await filled(dutch);
      const basic = await filled(french);

      // Assert
      expect(excellent).toBeGreaterThan(0.95);
      expect(basic).toBeGreaterThan(0);
      expect(basic).toBeLessThan(excellent);
    });
  });
});
