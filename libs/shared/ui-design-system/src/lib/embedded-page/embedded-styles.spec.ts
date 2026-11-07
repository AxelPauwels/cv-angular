import { applyAppFont } from './embedded-font';

describe('applyAppFont', () => {
  const root = document.documentElement;

  afterEach(() => {
    root.style.removeProperty('--mat-sys-body-medium-font');
    root.style.removeProperty('--mat-sys-headline-small-font');
    document.querySelectorAll('iframe').forEach((frame) => frame.remove());
  });

  /** A same-origin page with text, a heading, code and an icon */
  async function embed(): Promise<HTMLIFrameElement> {
    const frame = document.createElement('iframe');
    const loaded = new Promise((resolve) =>
      frame.addEventListener('load', resolve, { once: true })
    );
    frame.srcdoc = `<body style="font-family: serif">
      <h1>Title</h1><p>Text</p><code>code</code><span class="icon" style="font-family: IconFont">i</span>
    </body>`;
    document.body.append(frame);
    await loaded;
    return frame;
  }

  const fontOf = (frame: HTMLIFrameElement, selector: string) => {
    const doc = frame.contentDocument as Document;
    const element = doc.querySelector(selector) as Element;
    return doc.defaultView?.getComputedStyle(element).fontFamily;
  };

  it("gives the page the app's text and heading fonts, but not code or icons", async () => {
    // Arrange
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');
    root.style.setProperty(
      '--mat-sys-headline-small-font',
      'Michroma, sans-serif'
    );
    const frame = await embed();

    // Act
    applyAppFont(frame, document);

    // Assert
    expect(fontOf(frame, 'p')).toBe('Goldman, sans-serif');
    expect(fontOf(frame, 'h1')).toBe('Michroma, sans-serif');
    expect(fontOf(frame, 'code')).not.toContain('Goldman');
    expect(fontOf(frame, '.icon')).not.toContain('Goldman');
  });

  it('replaces the font when called again', async () => {
    // Arrange
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');
    const frame = await embed();
    applyAppFont(frame, document);

    // Act
    root.style.setProperty(
      '--mat-sys-body-medium-font',
      'Syncopate, sans-serif'
    );
    applyAppFont(frame, document);

    // Assert
    expect(fontOf(frame, 'p')).toBe('Syncopate, sans-serif');
    expect(
      frame.contentDocument?.querySelectorAll('#cv-embedded-font')
    ).toHaveLength(1);
  });

  it("leaves the page alone without the app's typography", async () => {
    // Arrange
    const frame = await embed();

    // Act
    applyAppFont(frame, document);

    // Assert
    expect(
      frame.contentDocument?.getElementById('cv-embedded-font')
    ).toBeNull();
    expect(fontOf(frame, 'p')).toBe('serif');
  });
});
