/** The <style> this file adds to an embedded page */
const STYLE_ID = 'cv-embedded-font';

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
 * The app's @font-face rules, with their urls made absolute: a relative url would
 * otherwise resolve against the embedded page instead of the app's stylesheet.
 */
function fontFaces(source: Document): string {
  const rules: string[] = [];
  for (const sheet of Array.from(source.styleSheets)) {
    let sheetRules: CSSRuleList;
    try {
      sheetRules = sheet.cssRules;
    } catch {
      continue; // a cross-origin stylesheet (e.g. the icon font) can't be read
    }
    const base = sheet.href ?? source.baseURI;
    for (const rule of Array.from(sheetRules)) {
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
  }
  return rules.join('\n');
}

/**
 * Gives a same-origin embedded page (a test report, the GraphQL docs) the app's
 * current font: Material's body font for text and its headline font for headings,
 * read from the `--mat-sys-*` variables on the app's <html>. Code and icons keep
 * their own font. Calling it again replaces the previous font; a cross-origin page
 * can't be reached and is left alone.
 */
export function applyAppFont(frame: HTMLIFrameElement, source: Document): void {
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

  let style = target.getElementById(STYLE_ID);
  if (!style) {
    style = target.createElement('style');
    style.id = STYLE_ID;
    target.head.append(style);
  }
  // !important: the page's own stylesheets are more specific than these rules
  style.textContent = `${fontFaces(source)}
:where(body, body *):not(${KEEP_OWN_FONT}) { font-family: ${text} !important; }
:is(h1, h2, h3, h4, h5, h6):not(${KEEP_OWN_FONT}) { font-family: ${headings || text} !important; }`;
}
