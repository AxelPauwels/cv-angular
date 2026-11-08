import { defineMacWindow, MAC_WINDOW_TAG } from './public-api';

/** Waits until the element's Angular view is rendered. */
async function render(tagName: string, html = ''): Promise<HTMLElement> {
  const element = document.createElement(tagName);
  element.innerHTML = html;
  document.body.appendChild(element);

  await customElements.whenDefined(tagName);
  await vi.waitFor(() => {
    if (!element.querySelector('.mw')) {
      throw new Error(`<${tagName}> has not rendered yet`);
    }
  });

  return element;
}

describe('mac-window element', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('uses "mac-window" as the default tag', () => {
    // Arrange
    const expected = 'mac-window';

    // Act
    const tag = MAC_WINDOW_TAG;

    // Assert
    expect(tag).toBe(expected);
  });

  it('registers <mac-window> when the entry point is imported', async () => {
    // Arrange
    const tag = MAC_WINDOW_TAG;

    // Act
    await customElements.whenDefined(tag);

    // Assert
    expect(customElements.get(tag)).toBeDefined();
  });

  it('renders the window with its traffic-light buttons', async () => {
    // Arrange
    const tag = MAC_WINDOW_TAG;

    // Act
    const element = await render(tag);

    // Assert
    expect(element.querySelectorAll('.mw__controls .mw__btn')).toHaveLength(3);
  });

  it('projects its children into the content area', async () => {
    // Arrange
    const child = '<p class="child">Hello</p>';

    // Act
    const element = await render(MAC_WINDOW_TAG, child);

    // Assert
    expect(element.querySelector('.mw__content .child')?.textContent).toBe(
      'Hello'
    );
  });

  it('registers a custom tag name', async () => {
    // Arrange
    const tag = 'custom-mac-window';

    // Act
    await defineMacWindow(tag);

    // Assert
    expect(customElements.get(tag)).toBeDefined();
    expect((await render(tag)).querySelector('.mw')).not.toBeNull();
  });

  it('can be called again for a tag that is already defined', async () => {
    // Arrange
    await customElements.whenDefined(MAC_WINDOW_TAG);
    const before = customElements.get(MAC_WINDOW_TAG);

    // Act
    const result = await defineMacWindow();

    // Assert
    expect(result).toBeUndefined();
    expect(customElements.get(MAC_WINDOW_TAG)).toBe(before);
  });

  it('can be called several times at once for the same tag', async () => {
    // Arrange
    const tag = 'parallel-mac-window';

    // Act
    const defined = Promise.all([defineMacWindow(tag), defineMacWindow(tag)]);

    // Assert
    await expect(defined).resolves.toBeDefined();
    expect(customElements.get(tag)).toBeDefined();
  });

  it('leaves a tag that is defined by someone else untouched', async () => {
    // Arrange
    class Other extends HTMLElement {}
    customElements.define('taken-mac-window', Other);

    // Act
    await defineMacWindow('taken-mac-window');

    // Assert
    expect(customElements.get('taken-mac-window')).toBe(Other);
  });
});
