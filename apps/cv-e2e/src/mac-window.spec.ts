import { expect, Locator, Page, test } from '@playwright/test';

/** The mac window showcased next to the micro-frontend */
const macWindow = (page: Page): Locator =>
  page.locator('showcase-micro-frontends lib-mac-window');

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`${locator} is not visible`);
  }
  return box;
}

test.describe('mac-window', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase/micro-frontends');
    // The page is lazy-loaded; against the unminified dev server with parallel
    // workers that can take several seconds. Wait for it once, so the
    // assertions below keep the default timeout.
    await expect(macWindow(page).locator('.mw__controls')).toBeVisible({
      timeout: 20_000,
    });
  });

  test('is showcased in its own tab, as a component library', async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/showcase\/micro-frontends$/);
    await expect(
      page.getByRole('heading', { name: 'Component library: <lib-mac-window>' })
    ).toBeVisible();
  });

  test('projects its content into the window body', async ({ page }) => {
    await expect(macWindow(page).locator('.mw__content')).toHaveText(
      'Anything placed here is projected into the window.'
    );
  });

  test('draws the title bar with the red, yellow and green buttons', async ({
    page,
  }) => {
    const controls = macWindow(page).locator('.mw__controls');
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
    const controls = await boxOf(macWindow(page).locator('.mw__controls'));
    const content = await boxOf(macWindow(page).locator('.mw__content'));

    expect(controls.y + controls.height).toBeLessThanOrEqual(content.y + 1);
  });

  test('has rounded corners and a shadow', async ({ page }) => {
    const frame = macWindow(page).locator('.mw');

    await expect(frame).toHaveCSS('border-radius', '20px');
    await expect(frame).not.toHaveCSS('box-shadow', 'none');
  });
});
