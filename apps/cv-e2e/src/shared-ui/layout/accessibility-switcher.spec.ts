import { expect, Page, test } from '@playwright/test';
import { html, openShell } from '../../support/ui';

/** `ds-accessibility-switcher` (shared-ui-layout): the accessibility settings popover */
const trigger = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Accessibility' });

const panel = (page: Page) =>
  page.getByRole('dialog', { name: 'Accessibility' });

test.describe('ds-accessibility-switcher', () => {
  test.beforeEach(async ({ page }) => {
    await openShell(page);
  });

  test('opens a dialog with the settings', async ({ page }) => {
    // Arrange
    const button = trigger(page);

    // Act
    await button.click();

    // Assert
    await expect(panel(page)).toBeVisible();
    await expect(
      panel(page).getByRole('radio', { name: '100%' })
    ).toBeChecked();
    await expect(
      panel(page)
        .getByRole('radiogroup', { name: 'Text size' })
        .getByRole('radio')
    ).toHaveCount(4);
    await expect(
      panel(page).getByRole('switch', { name: 'Reduce motion' })
    ).not.toBeChecked();
    await expect(
      panel(page).getByRole('switch', { name: 'Higher contrast' })
    ).not.toBeChecked();
    await expect(
      panel(page).getByRole('switch', { name: 'Wider text spacing' })
    ).not.toBeChecked();
  });

  test('changes the text size', async ({ page }) => {
    // Arrange
    await trigger(page).click();
    const fontSize = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
    const before = await fontSize();

    // Act
    await panel(page).getByRole('radio', { name: '125%' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-text-size', '125');
    await expect(
      panel(page).getByRole('radio', { name: '125%' })
    ).toBeChecked();
    await expect.poll(fontSize).not.toBe(before);
  });

  test('switches reduced motion, higher contrast and wider spacing on', async ({
    page,
  }) => {
    // Arrange
    await trigger(page).click();

    // Act
    await panel(page).getByRole('switch', { name: 'Reduce motion' }).click();
    await panel(page).getByRole('switch', { name: 'Higher contrast' }).click();
    await panel(page)
      .getByRole('switch', { name: 'Wider text spacing' })
      .click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-reduce-motion', '');
    await expect(html(page)).toHaveAttribute('data-high-contrast', '');
    await expect(html(page)).toHaveAttribute('data-wide-text-spacing', '');
  });

  test('remembers the settings', async ({ page }) => {
    // Arrange
    await trigger(page).click();
    await panel(page).getByRole('switch', { name: 'Higher contrast' }).click();
    await expect(html(page)).toHaveAttribute('data-high-contrast', '');

    // Act
    await page.reload();

    // Assert
    await expect(html(page)).toHaveAttribute('data-high-contrast', '');
  });

  test('resets every setting', async ({ page }) => {
    // Arrange
    await trigger(page).click();
    await panel(page).getByRole('radio', { name: '150%' }).click();
    await panel(page).getByRole('switch', { name: 'Reduce motion' }).click();

    // Act
    await panel(page).getByRole('button', { name: 'Reset' }).click();

    // Assert
    await expect(html(page)).toHaveAttribute('data-text-size', '100');
    await expect(html(page)).not.toHaveAttribute('data-reduce-motion');
    await expect(
      panel(page).getByRole('switch', { name: 'Reduce motion' })
    ).not.toBeChecked();
  });

  test('opens with the keyboard and closes with Escape', async ({ page }) => {
    // Arrange
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    await expect(panel(page)).toBeVisible();
    await panel(page).getByRole('switch', { name: 'Reduce motion' }).focus();

    // Act
    await page.keyboard.press('Escape');

    // Assert
    await expect(panel(page)).toBeHidden();
  });
});
