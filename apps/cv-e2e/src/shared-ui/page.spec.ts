import { expect, test } from '@playwright/test';
import { boxOf, open } from '../support/ui';

/** `ds-page-layout`, `ds-page-title` and `ds-section-heading` (shared-ui-page) */
test.describe('ds-page-title', () => {
  for (const [url, title] of [
    ['/cv/personal', 'personal'],
    ['/cv/education', 'Education'],
    ['/cv/skills', 'skills'],
    ['/showcase/micro-frontends', 'Micro-frontends'],
    ['/technical/foundations', 'Frontend foundations'],
    ['/technical/versions', 'Versions'],
  ] as const) {
    test(`gives ${url} exactly one translated <h1>`, async ({ page }) => {
      // Arrange
      await open(page, url);

      // Act
      const headings = page.getByRole('heading', { level: 1 });

      // Assert
      await expect(headings).toHaveCount(1);
      await expect(headings).toHaveText(new RegExp(title, 'i'));
    });
  }

  test('shows no native tooltip with the raw translation key', async ({
    page,
  }) => {
    // Arrange
    await open(page, '/cv/personal');

    // Act
    const host = page.locator('ds-page-title');

    // Assert
    await expect(host).not.toHaveAttribute('title');
  });
});

test.describe('ds-section-heading', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, '/cv/personal');
  });

  test('names its section by the heading, with the tagline below it', async ({
    page,
  }) => {
    // Arrange
    const section = page.getByRole('region', { name: 'Languages' });

    // Act
    const heading = section.getByRole('heading', { level: 2 });

    // Assert
    await expect(heading).toHaveText('Languages');
    await expect(heading).toHaveAttribute('id', 'personal-languages-title');
    await expect(
      section.locator('.ds-section-heading__tagline')
    ).not.toBeEmpty();
    await expect(
      page.locator('ds-section-heading').first()
    ).not.toHaveAttribute('title');
  });

  test('groups the heading and the tagline', async ({ page }) => {
    // Arrange
    const section = page.getByRole('region', { name: 'About me' });

    // Act
    const group = section.locator('hgroup');

    // Assert
    await expect(group.getByRole('heading', { level: 2 })).toHaveText(
      'About me'
    );
    await expect(group.locator('p')).toHaveCount(1);
  });
});

test.describe('ds-page-layout', () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test('keeps a wide page wider than a narrow one, both centered', async ({
    page,
  }) => {
    // Arrange
    await open(page, '/cv/personal');
    const wide = await boxOf(page.locator('ds-page-layout'));
    await open(page, '/cv/experience');

    // Act
    const layout = page.locator('ds-page-layout');
    const narrow = await boxOf(layout);
    // centered by equal auto margins (a box measure would count a classic scrollbar on one side)
    const [left, right] = await layout.evaluate((el) => [
      parseFloat(getComputedStyle(el).marginLeft),
      parseFloat(getComputedStyle(el).marginRight),
    ]);

    // Assert
    expect(wide.width).toBeGreaterThan(narrow.width);
    await expect(layout).toHaveClass(/ds-page-layout--narrow/);
    expect(left).toBeGreaterThan(0);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  });

  test('fills a phone screen with the same padding on both sides', async ({
    page,
  }) => {
    // Arrange
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/cv/personal');

    // Act
    const layout = page.locator('ds-page-layout');

    // Assert
    await expect(layout).toHaveCSS('padding-left', '16px');
    await expect(layout).toHaveCSS('padding-right', '16px');
  });
});
