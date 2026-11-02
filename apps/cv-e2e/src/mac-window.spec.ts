import { expect, Locator, Page, test } from '@playwright/test';

const windows = (page: Page): Locator => page.locator('lib-mac-window');

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`${locator} is not visible`);
  }
  return box;
}

test.describe('mac-window', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the app title in a window', async ({ page }) => {
    const appWindow = windows(page).first();

    await expect(appWindow.getByRole('heading', { level: 1 })).toHaveText('cv');
  });

  test('shows the home page content in a window', async ({ page }) => {
    await expect(page).toHaveURL(/\/home$/);
    await expect(
      windows(page).filter({ hasText: 'Hello from inside the window' })
    ).toBeVisible();
  });

  test('draws the title bar with the red, yellow and green buttons', async ({
    page,
  }) => {
    const appWindow = windows(page).first();
    const controls = appWindow.locator('.mw__controls');
    const buttons = controls.locator('.mw__btn');

    await expect(controls).toHaveCSS('background-color', 'rgb(43, 43, 43)');
    await expect(buttons).toHaveCount(3);
    await expect(buttons.nth(0)).toHaveCSS(
      'background-color',
      'rgb(255, 92, 95)'
    );
    await expect(buttons.nth(1)).toHaveCSS(
      'background-color',
      'rgb(250, 200, 1)'
    );
    await expect(buttons.nth(2)).toHaveCSS(
      'background-color',
      'rgb(52, 199, 89)'
    );
  });

  test('places the title bar above the content', async ({ page }) => {
    const appWindow = windows(page).first();
    const controls = await boxOf(appWindow.locator('.mw__controls'));
    const content = await boxOf(appWindow.locator('.mw__content'));

    expect(controls.y + controls.height).toBeLessThanOrEqual(content.y + 1);
  });

  test('has rounded corners and a shadow', async ({ page }) => {
    const frame = windows(page).first().locator('.mw');

    await expect(frame).toHaveCSS('border-radius', '20px');
    await expect(frame).not.toHaveCSS('box-shadow', 'none');
  });
});
