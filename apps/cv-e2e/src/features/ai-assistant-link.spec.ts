import { expect, Locator, Page, test } from '@playwright/test';
import {
  boxOf,
  open,
  PAGE_LOAD_TIMEOUT,
  setFeatureToggles,
} from '../support/ui';

/**
 * The AI assistant link in the footer (cv-feature-contact): a robot in a filled
 * circle before the contact icons, with a soft pulse around it like the home
 * page's tour button
 */
const contactLinks = (page: Page) =>
  page.getByRole('list', { name: "Let's talk" });
const aiLink = (page: Page) =>
  contactLinks(page).getByRole('link', { name: 'Ask my AI assistant' });
const circle = (link: Locator) => link.locator('.contact-links__ai');

/** Opens a page and scrolls the footer into view, so its links load */
async function openFooter(page: Page): Promise<void> {
  await open(page, '/cv/personal');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(contactLinks(page)).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
}

/** A computed style of the pulse, the circle's ::before */
const pulse = (link: Locator, property: string) =>
  circle(link).evaluate(
    (el, name) => getComputedStyle(el, '::before').getPropertyValue(name),
    property
  );

test.describe('AI assistant link in the footer', () => {
  test('comes first, before the contact icons, and opens the AI assistant', async ({
    page,
  }) => {
    // Arrange
    await openFooter(page);
    const links = contactLinks(page).getByRole('link');

    // Act
    await aiLink(page).click();

    // Assert
    await expect(page).toHaveURL(/\/showcase\/ai-assistant$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'AI assistant' })
    ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    await page.goBack();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(links).toHaveCount(4, { timeout: PAGE_LOAD_TIMEOUT });
    await expect(links.first()).toHaveAccessibleName('Ask my AI assistant');
  });

  test('is icon-only: the robot is hidden from screen readers', async ({
    page,
  }) => {
    // Arrange
    await openFooter(page);

    // Act
    const robot = aiLink(page).locator('svg');

    // Assert
    await expect(aiLink(page)).toHaveAttribute(
      'href',
      '/showcase/ai-assistant'
    );
    await expect(robot).toHaveAttribute('aria-hidden', 'true');
  });

  test('is left out while the AI assistant is switched off', async ({
    page,
  }) => {
    // Arrange
    await setFeatureToggles(page, { 'showcase-ai-assistant': false });

    // Act
    await openFooter(page);

    // Assert
    const names = await contactLinks(page)
      .getByRole('link')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('aria-label'))
      );
    expect(names).toEqual(['Contact', 'LinkedIn', 'GitHub']);
  });

  test('pulses around the circle, forever', async ({ page }) => {
    // Arrange
    await openFooter(page);

    // Act
    const animation = await pulse(aiLink(page), 'animation-name');
    const iterations = await pulse(aiLink(page), 'animation-iteration-count');

    // Assert
    expect(animation).toContain('contact-links-ai-pulse');
    expect(iterations).toBe('infinite');
  });

  test.describe('on a desktop screen, where only the content scrolls', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test('never makes the page taller while it pulses (no scrollbar flicker)', async ({
      page,
    }) => {
      // Arrange
      await openFooter(page);
      const heights = () =>
        page.evaluate(() => {
          const root = document.documentElement;
          return [root.scrollHeight, root.clientHeight];
        });

      // Act: every 100ms of one 3.6s pulse cycle, paused at that moment
      const overflows = await page.evaluate(async () => {
        const animation = document
          .getAnimations()
          .find((a) =>
            (a as CSSAnimation).animationName?.includes(
              'contact-links-ai-pulse'
            )
          );
        animation?.pause();
        const found: number[] = [];
        for (let time = 0; time <= 3600; time += 100) {
          if (animation) animation.currentTime = 3000 + time;
          await new Promise(requestAnimationFrame);
          const root = document.documentElement;
          if (root.scrollHeight > root.clientHeight) found.push(time);
        }
        animation?.play();
        return found;
      });

      // Assert
      expect(overflows).toEqual([]);
      const [scrollHeight, clientHeight] = await heights();
      expect(scrollHeight).toBe(clientHeight);
    });
  });

  test('turns into an outlined icon on hover: no circle, no pulse, a bigger robot', async ({
    page,
  }) => {
    // Arrange
    await openFooter(page);
    const link = aiLink(page);
    const robot = link.locator('svg');
    const { width: restingWidth } = await boxOf(robot);

    // Act
    await link.hover();

    // Assert
    await expect
      .poll(() =>
        circle(link).evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => pulse(link, 'animation-name')).toBe('none');
    // drawn at 2.45rem and scaled down to 1.75rem at rest: it grows back to 1.4×
    await expect
      .poll(async () => (await boxOf(robot)).width)
      .toBeCloseTo(restingWidth * 1.4, 0);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('shows no pulse', async ({ page }) => {
      // Arrange
      await openFooter(page);

      // Act
      const display = await pulse(aiLink(page), 'display');

      // Assert
      expect(display).toBe('none');
    });
  });
});
