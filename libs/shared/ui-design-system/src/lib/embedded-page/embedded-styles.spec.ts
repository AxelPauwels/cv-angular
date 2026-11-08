import { applyAppStyles } from './embedded-styles';

describe('applyAppStyles', () => {
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
    frame.srcdoc = `<body style="font-family: serif; background: white">
      <h1>Title</h1><p>Text</p>
      <div class="wrapper" style="background: white"><div id="cytoscape-graph" style="background: white"></div></div><code>code</code><span class="icon" style="font-family: IconFont">i</span>
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
    applyAppStyles(frame, document);

    // Assert
    expect(fontOf(frame, 'p')).toBe('Goldman, sans-serif');
    expect(fontOf(frame, 'h1')).toBe('Michroma, sans-serif');
    expect(fontOf(frame, 'code')).not.toContain('Goldman');
    expect(fontOf(frame, '.icon')).not.toContain('Goldman');
  });

  it('makes the page background transparent, also behind the project graph', async () => {
    // Arrange
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');
    const frame = await embed();

    // Act
    applyAppStyles(frame, document);

    // Assert
    const doc = frame.contentDocument as Document;
    const background = (element: Element) =>
      doc.defaultView?.getComputedStyle(element).backgroundColor;
    expect(background(doc.documentElement)).toBe('rgba(0, 0, 0, 0)');
    expect(background(doc.body)).toBe('rgba(0, 0, 0, 0)');
    // the project graph's canvas and its wrapper
    expect(background(doc.querySelector('.wrapper') as Element)).toBe(
      'rgba(0, 0, 0, 0)'
    );
    expect(background(doc.getElementById('cytoscape-graph') as Element)).toBe(
      'rgba(0, 0, 0, 0)'
    );
  });

  it("adds the page's own styles, with the app's theme colors resolved", async () => {
    // Arrange
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');
    root.style.setProperty('--test-accent', 'rgb(1, 2, 3)');
    const frame = await embed();

    // Act
    applyAppStyles(
      frame,
      document,
      'p { color: var(--test-accent) !important; } h1 { display: none; }'
    );

    // Assert
    const doc = frame.contentDocument as Document;
    const style = (selector: string) =>
      doc.defaultView?.getComputedStyle(doc.querySelector(selector) as Element);
    expect(style('p')?.color).toBe('rgb(1, 2, 3)');
    expect(style('h1')?.display).toBe('none');
    root.style.removeProperty('--test-accent');
  });

  it('replaces the font when called again', async () => {
    // Arrange
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');
    const frame = await embed();
    applyAppStyles(frame, document);

    // Act
    root.style.setProperty(
      '--mat-sys-body-medium-font',
      'Syncopate, sans-serif'
    );
    applyAppStyles(frame, document);

    // Assert
    expect(fontOf(frame, 'p')).toBe('Syncopate, sans-serif');
    expect(
      frame.contentDocument?.querySelectorAll('#cv-embedded-styles')
    ).toHaveLength(1);
  });

  it("leaves the page alone without the app's typography", async () => {
    // Arrange
    const frame = await embed();

    // Act
    applyAppStyles(frame, document);

    // Assert
    expect(
      frame.contentDocument?.getElementById('cv-embedded-styles')
    ).toBeNull();
    expect(fontOf(frame, 'p')).toBe('serif');
  });
});
