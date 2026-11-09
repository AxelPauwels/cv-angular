/** The <style> this file adds to an embedded page */
const STYLE_ID = 'cv-embedded-styles';

/**
 * Text that keeps the embedded page's own font: code, and icons (as icon font or svg),
 * which would turn into letters or lose their alignment in a text font.
 */
const KEEP_OWN_FONT = [
  'code',
  'pre',
  'kbd',
  'samp',
  'code *',
  'pre *',
  'svg',
  'svg *',
  "[class*='icon' i]",
  "[class*='icon' i] *",
].join(', ');

/**
 * Page-sized backgrounds made transparent so the app's background shows through:
 * the page itself, the Nx project graph's canvas, its wrapper and the full-size
 * message over it (e.g. "No tasks found" on the tasks graph), which paint the
 * whole page white, and the GraphQL docs' sidebar. Panels and controls keep their
 * own background.
 */
const TRANSPARENT = [
  'html',
  'body',
  '#cytoscape-graph',
  ':has(> #cytoscape-graph)',
  ':has(> #cytoscape-graph) > .inset-0',
  '#sidebar',
].join(', ');

/**
 * The scrollbar colors inside an embedded page: the same faded text color as the
 * app's (see the scrollbar mixin in the app's styles), but from the page's own color
 * scheme, so the thumb stays visible on a light report in a dark app.
 */
const SCROLLBAR_COLORS = `:root {
  --ds-scrollbar-thumb: color-mix(in srgb, CanvasText 45%, transparent);
  --ds-scrollbar-thumb-hover: color-mix(in srgb, CanvasText 65%, transparent);
}`;

/** Embedded pages that already keep their mode in sync (see matchColorScheme) */
const watched = new WeakSet<Document>();

/** Sets the mode classes the reports use, see matchColorScheme */
function setModeClasses(target: Document): void {
  const dark = target.documentElement.dataset['cvColorScheme'] === 'dark';
  const root = target.documentElement;
  root.classList.toggle('dark-mode', dark);
  root.classList.toggle('light-mode', !dark);
  target.body?.classList.toggle('vscode-dark', dark);
  target.body?.classList.toggle('vscode-light', !dark);
}

/**
 * Puts the embedded page in the app's light or dark mode instead of the system's:
 * the generated reports pick their theme from `prefers-color-scheme` (an iframe
 * gets the system's, not the app's), so on a phone in dark mode they'd turn dark
 * in a light app. Each report takes a class instead: Playwright `light-mode` /
 * `dark-mode` on <html>, the Nx project graph (theme "system") `vscode-light` /
 * `vscode-dark` on <body>, which it watches. Other pages ignore the classes.
 * Playwright sets its own class again after loading, so an observer puts ours
 * back; setting a class that is already there changes nothing, so it settles.
 */
function matchColorScheme(target: Document, source: Document): void {
  const dark = getComputedStyle(source.documentElement).colorScheme === 'dark';
  const scheme = dark ? 'dark' : 'light';
  const root = target.documentElement;
  root.dataset['cvColorScheme'] = scheme;
  root.style.colorScheme = scheme;
  setModeClasses(target);

  if (!watched.has(target) && target.defaultView) {
    watched.add(target);
    new target.defaultView.MutationObserver(() =>
      setModeClasses(target)
    ).observe(root, { attributeFilter: ['class'] });
  }
}

/** The rules of the app's stylesheets, skipping cross-origin ones (e.g. the icon font) */
function* appRules(source: Document): Generator<[CSSRule, string]> {
  for (const sheet of Array.from(source.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const base = sheet.href ?? source.baseURI;
    for (const rule of Array.from(rules)) {
      yield [rule, base];
    }
  }
}

/**
 * The app's @font-face rules, with their urls made absolute: a relative url would
 * otherwise resolve against the embedded page instead of the app's stylesheet.
 */
function fontFaces(source: Document): string {
  const rules: string[] = [];
  for (const [rule, base] of appRules(source)) {
    if (rule instanceof CSSFontFaceRule) {
      rules.push(
        rule.cssText.replace(
          /url\((['"]?)([^'")]+)\1\)/g,
          (match: string, quote: string, url: string) =>
            match.replace(url, new URL(url, base).href)
        )
      );
    }
  }
  return rules.join('\n');
}

/**
 * The app's global scrollbar rules (from the scrollbar mixin), so an embedded page
 * scrolls with the same slim scrollbar. Component styles (with Angular's
 * `_ngcontent` attributes) are left out: they can't match in another page.
 */
function scrollbarRules(source: Document): string {
  const rules: string[] = [];
  for (const [rule] of appRules(source)) {
    const isScrollbarRule =
      (rule instanceof CSSStyleRule &&
        rule.selectorText.includes('::-webkit-scrollbar')) ||
      (rule instanceof CSSSupportsRule &&
        rule.conditionText.includes('-webkit-scrollbar'));
    if (isScrollbarRule && !/_ng(content|host)/.test(rule.cssText)) {
      rules.push(rule.cssText);
    }
  }
  return rules.join('\n');
}

/**
 * The app's theme colors that `css` uses as `var(--name)`, resolved to plain colors
 * and declared on the embedded page's root: the page doesn't have the app's
 * theme variables. Resolved through a probe element, so `light-dark()` and
 * `color-mix()` follow the app's current palette and mode.
 */
function themeColors(css: string, source: Document): string {
  const names = new Set(
    Array.from(css.matchAll(/var\((--[\w-]+)/g), (match) => match[1])
  );
  if (names.size === 0) {
    return '';
  }
  const probe = source.createElement('span');
  probe.hidden = true;
  source.body.append(probe);
  const declarations = Array.from(names, (name) => {
    probe.style.color = `var(${name})`;
    return `${name}: ${getComputedStyle(probe).color};`;
  });
  probe.remove();
  return `:root { ${declarations.join(' ')} }`;
}

/**
 * Makes a same-origin embedded page (a test report, the GraphQL docs) blend into
 * the app:
 * - the app's current font: Material's body font for text and its headline font
 *   for headings, read from the `--mat-sys-*` variables on the app's <html>; code
 *   and icons keep their own font
 * - a transparent page background (see TRANSPARENT), so the app's background
 *   shows through. When the app is in dark mode and the page isn't, the browser
 *   keeps the page's own light backdrop (color schemes differ), so its dark text
 *   stays readable.
 * - the app's light or dark mode, not the system's (see matchColorScheme)
 * - the app's slim scrollbar (see scrollbarRules)
 * - `extraStyles`: rules for this page only (e.g. hiding a heading the page title
 *   already shows). They may use the app's theme colors as `var(--mat-sys-…)`
 *   (colors only), see themeColors.
 *
 * Calling it again replaces the previous styles; a cross-origin page can't be
 * reached and is left alone.
 */
export function applyAppStyles(
  frame: HTMLIFrameElement,
  source: Document,
  extraStyles = ''
): void {
  let target: Document | null;
  try {
    target = frame.contentDocument;
  } catch {
    return;
  }
  if (!target?.head) {
    return;
  }

  const variables = getComputedStyle(source.documentElement);
  const text = variables.getPropertyValue('--mat-sys-body-medium-font').trim();
  const headings = variables
    .getPropertyValue('--mat-sys-headline-small-font')
    .trim();
  if (!text) {
    return; // the app's typography isn't loaded (e.g. in a unit test without styles)
  }

  matchColorScheme(target, source);

  let style = target.getElementById(STYLE_ID);
  if (!style) {
    style = target.createElement('style');
    style.id = STYLE_ID;
    target.head.append(style);
  }
  // !important: the page's own stylesheets are more specific than these rules
  style.textContent = `${fontFaces(source)}
${TRANSPARENT} { background: transparent !important; }
:where(body, body *):not(${KEEP_OWN_FONT}) { font-family: ${text} !important; }
:is(h1, h2, h3, h4, h5, h6):not(${KEEP_OWN_FONT}) { font-family: ${headings || text} !important; }
${SCROLLBAR_COLORS}
${scrollbarRules(source)}
${themeColors(extraStyles, source)}
${extraStyles}`;
}
