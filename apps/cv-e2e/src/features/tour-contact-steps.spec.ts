import { expect, Page, test } from '@playwright/test';
import {
  boxOf,
  openShell,
  PAGE_LOAD_TIMEOUT,
  setFeatureToggles,
} from '../support/ui';

/**
 * The tour's last steps (shared-feature-tour): the contact icons, then the AI
 * assistant link next to them, each in its own spotlight. 1024px wide, where
 * the tour's back/next bar would cover the AI assistant link. Reduced motion,
 * so the spotlight and the bar move without a transition.
 */
const spotlight = (page: Page) => page.locator('.tour__spotlight');
const counter = (page: Page) => page.locator('.tour__counter');
const footerLink = (page: Page, name: string) =>
  page
    .getByRole('list', { name: "Let's talk" })
    .getByRole('link', { name, exact: true });

/** Starts the tour on the home page and steps forward to the given step */
async function tourTo(page: Page, step: number): Promise<void> {
  await openShell(page, '/home');
  await page.locator('[data-tour="start"]').click();
  await expect(counter(page)).toContainText('1 /', {
    timeout: PAGE_LOAD_TIMEOUT,
  });
  for (let current = 1; current < step; current++) {
    await page.keyboard.press('ArrowRight');
    await expect(counter(page)).toContainText(`${current + 1} /`, {
      timeout: PAGE_LOAD_TIMEOUT,
    });
  }
  await expect(spotlight(page)).toHaveClass(/tour__spotlight--active/, {
    timeout: PAGE_LOAD_TIMEOUT,
  });
}

/** Whether two boxes overlap */
const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/** Whether `outer` contains `inner` */
const contains = (
  outer: { x: number; y: number; width: number; height: number },
  inner: { x: number; y: number; width: number; height: number }
) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

test.describe('tour: contact and AI assistant steps', () => {
  test.use({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });

  test('counts the AI assistant step: 8 steps in all', async ({ page }) => {
    // Arrange
    await openShell(page, '/home');

    // Act
    await page.locator('[data-tour="start"]').click();

    // Assert
    await expect(counter(page)).toHaveText('1 / 8', {
      timeout: PAGE_LOAD_TIMEOUT,
    });
  });

  test('step 6 spotlights the three contact icons, not the AI assistant link', async ({
    page,
  }) => {
    // Arrange
    await tourTo(page, 6);

    // Act
    const spot = await boxOf(spotlight(page));

    // Assert
    for (const name of ['Contact', 'LinkedIn', 'GitHub']) {
      expect(contains(spot, await boxOf(footerLink(page, name))), name).toBe(
        true
      );
    }
    const ai = await boxOf(footerLink(page, 'Ask my AI assistant'));
    expect(overlaps(spot, ai)).toBe(false);
  });

  test('step 7 spotlights the AI assistant link in a circle, clear of the bar', async ({
    page,
  }) => {
    // Arrange
    await tourTo(page, 7);

    // Act
    const spot = await boxOf(spotlight(page));
    const ai = await boxOf(footerLink(page, 'Ask my AI assistant'));
    const bar = await boxOf(page.locator('.tour__footer'));

    // Assert
    expect(contains(spot, ai)).toBe(true);
    // a circle centered on the link
    expect(spot.width).toBe(spot.height);
    expect(spot.x + spot.width / 2).toBeCloseTo(ai.x + ai.width / 2, 0);
    expect(spot.y + spot.height / 2).toBeCloseTo(ai.y + ai.height / 2, 0);
    await expect(spotlight(page)).toHaveCSS('border-radius', '50%');
    // the back/next bar moved up out of its way
    expect(overlaps(bar, spot)).toBe(false);
  });

  test('leaves out the AI assistant step while the AI assistant is switched off', async ({
    page,
  }) => {
    // Arrange
    await setFeatureToggles(page, { 'showcase-ai-assistant': false });
    await openShell(page, '/home');

    // Act
    await page.locator('[data-tour="start"]').click();

    // Assert
    await expect(counter(page)).toHaveText('1 / 7', {
      timeout: PAGE_LOAD_TIMEOUT,
    });
  });
});
