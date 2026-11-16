import { expect, Locator, Page, Route } from '@playwright/test';

/**
 * Shared helpers for the e2e specs of the `libs/shared/ui-*` components. These
 * components have no page of their own: every spec drives them where the app
 * renders them (the shell, the cv pages, the showcase and technical pages).
 */

/** Below md (768px): the hamburger menu and the back-to-top button show */
export const PHONE = { width: 390, height: 844 } as const;

/**
 * Lazy pages against the unminified dev server, with parallel workers, can
 * take several seconds; wait once for this, so assertions keep their default timeout
 */
export const PAGE_LOAD_TIMEOUT = 20_000;

/** Opens a url and waits until its `<h1>` (every content page has one) shows */
export async function open(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
    timeout: PAGE_LOAD_TIMEOUT,
  });
}

/** Opens a url and waits until the main navbar is ready (also on pages without an `<h1>`) */
export async function openShell(page: Page, url = '/cv/personal') {
  await page.goto(url);
  await expect(page.locator('ds-main-navbar')).toBeVisible({
    timeout: PAGE_LOAD_TIMEOUT,
  });
}

/**
 * Feature toggles as the admin page saves them, before the app starts: the
 * given ones override the defaults (`feature-toggle-defaults.ts`)
 */
export async function setFeatureToggles(
  page: Page,
  toggles: Record<string, boolean>
): Promise<void> {
  await page.addInitScript((states) => {
    window.localStorage.setItem('cv-feature-toggles', JSON.stringify(states));
  }, toggles);
}

/**
 * The cv data is answered in the browser by a lazy chunk with the GraphQL
 * schema (`@cv/api`, see in-browser-graphql.interceptor.ts). Holding that chunk
 * back is the only way to make the data slow or failing, in dev and in a
 * production build alike: the chunk is found by the schema text it contains.
 */
export async function interceptCvApi(
  page: Page,
  handle: (route: Route, body: string) => Promise<void>
): Promise<void> {
  await page.route(/\.m?js(\?.*)?$/, async (route) => {
    try {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes('type AdditionalLearning')) {
        await handle(route, body);
      } else {
        await route.fulfill({ response, body });
      }
    } catch (error) {
      // a request still in flight when the test ends: nothing left to answer
      if (!page.isClosed() && !/disposed|closed/i.test(String(error))) {
        throw error;
      }
    }
  });
}

/** The `<html>` element, where the settings switchers leave their attributes */
export const html = (page: Page): Locator => page.locator('html');

/** The bounding box of a visible element, or a clear failure */
export async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`${locator} is not visible`);
  }
  return box;
}
