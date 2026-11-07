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
    // Act & Assert
    expect(MAC_WINDOW_TAG).toBe('mac-window');
  });

  it('registers <mac-window> when the entry point is imported', async () => {
    // Arrange & Act
    await customElements.whenDefined(MAC_WINDOW_TAG);

    // Assert
    expect(customElements.get(MAC_WINDOW_TAG)).toBeDefined();
  });

  it('renders the window with its traffic-light buttons', async () => {
    // Arrange & Act
    const element = await render(MAC_WINDOW_TAG);

    // Assert
    expect(element.querySelectorAll('.mw__controls .mw__btn')).toHaveLength(3);
  });

  it('projects its children into the content area', async () => {
    // Arrange & Act
    const element = await render(MAC_WINDOW_TAG, '<p class="child">Hello</p>');

    // Assert
    expect(element.querySelector('.mw__content .child')?.textContent).toBe(
      'Hello'
    );
  });

  it('registers a custom tag name', async () => {
    // Arrange & Act
    await defineMacWindow('custom-mac-window');

    // Assert
    expect(customElements.get('custom-mac-window')).toBeDefined();
    expect(
      (await render('custom-mac-window')).querySelector('.mw')
    ).not.toBeNull();
  });

  it('can be called again for a tag that is already defined', async () => {
    // Arrange & Act
    const before = customElements.get(MAC_WINDOW_TAG);

    // Assert
    await expect(defineMacWindow()).resolves.toBeUndefined();
    expect(customElements.get(MAC_WINDOW_TAG)).toBe(before);
  });

  it('can be called several times at once for the same tag', async () => {
    // Act & Assert
    await expect(
      Promise.all([
        defineMacWindow('parallel-mac-window'),
        defineMacWindow('parallel-mac-window'),
      ])
    ).resolves.toBeDefined();
    expect(customElements.get('parallel-mac-window')).toBeDefined();
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
