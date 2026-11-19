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

  describe('with stylesheets in the app', () => {
    const added: HTMLStyleElement[] = [];

    /** Adds a stylesheet to the app's document */
    function appStyle(css: string): HTMLStyleElement {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.append(style);
      added.push(style);
      return style;
    }

    const embeddedCss = (frame: HTMLIFrameElement) =>
      frame.contentDocument?.getElementById('cv-embedded-styles')
        ?.textContent ?? '';

    afterEach(() => {
      added.splice(0).forEach((style) => style.remove());
    });

    it("brings the app's fonts along, with urls that point at the app", async () => {
      // Arrange
      root.style.setProperty(
        '--mat-sys-body-medium-font',
        'Goldman, sans-serif'
      );
      appStyle(
        '@font-face { font-family: TestFont; src: url("fonts/test.woff2") format("woff2"); }'
      );
      const frame = await embed();

      // Act
      applyAppStyles(frame, document);

      // Assert
      const css = embeddedCss(frame);
      expect(css).toContain('TestFont');
      expect(css).toContain(new URL('fonts/test.woff2', document.baseURI).href);
    });

    it("brings the app's global scrollbar rules along, not a component's", async () => {
      // Arrange
      root.style.setProperty(
        '--mat-sys-body-medium-font',
        'Goldman, sans-serif'
      );
      appStyle(
        '.app-scroll::-webkit-scrollbar { width: 7px; } .cmp[_ngcontent-abc]::-webkit-scrollbar { width: 9px; }'
      );
      const frame = await embed();

      // Act
      applyAppStyles(frame, document);

      // Assert
      const css = embeddedCss(frame);
      expect(css).toContain('.app-scroll::-webkit-scrollbar');
      expect(css).not.toContain('_ngcontent-abc');
    });

    it('skips a stylesheet it may not read, like a cross-origin one', async () => {
      // Arrange
      root.style.setProperty(
        '--mat-sys-body-medium-font',
        'Goldman, sans-serif'
      );
      const style = appStyle(
        '@font-face { font-family: Hidden; src: url(x.woff2); }'
      );
      Object.defineProperty(style.sheet, 'cssRules', {
        get: () => {
          throw new DOMException('cross-origin', 'SecurityError');
        },
      });
      const frame = await embed();

      // Act
      applyAppStyles(frame, document);

      // Assert
      expect(embeddedCss(frame)).not.toContain('Hidden');
      expect(fontOf(frame, 'p')).toBe('Goldman, sans-serif');
    });
  });

  describe("the app's light or dark mode", () => {
    afterEach(() => {
      root.style.removeProperty('color-scheme');
    });

    it("puts the page in the app's dark mode, also when the page resets it", async () => {
      // Arrange
      root.style.setProperty(
        '--mat-sys-body-medium-font',
        'Goldman, sans-serif'
      );
      root.style.colorScheme = 'dark';
      const frame = await embed();
      const doc = frame.contentDocument as Document;

      // Act
      applyAppStyles(frame, document);
      // a report setting its own theme class after loading
      doc.documentElement.className = 'light-mode';

      // Assert
      expect(doc.body.classList).toContain('vscode-dark');
      expect(doc.body.classList).toContain('dark');
      await vi.waitFor(() =>
        expect(doc.documentElement.classList).toContain('dark-mode')
      );
      expect(doc.documentElement.classList).not.toContain('light-mode');
      expect(doc.documentElement.style.colorScheme).toBe('dark');
    });

    it("puts the page in the app's light mode", async () => {
      // Arrange
      root.style.setProperty(
        '--mat-sys-body-medium-font',
        'Goldman, sans-serif'
      );
      root.style.colorScheme = 'light';
      const frame = await embed();

      // Act
      applyAppStyles(frame, document);

      // Assert
      const doc = frame.contentDocument as Document;
      expect(doc.documentElement.classList).toContain('light-mode');
      expect(doc.body.classList).toContain('vscode-light');
    });

    it("keeps Compodoc in the app's light mode when it follows a dark system setting", async () => {
      // Arrange
      root.style.setProperty(
        '--mat-sys-body-medium-font',
        'Goldman, sans-serif'
      );
      root.style.colorScheme = 'light';
      const frame = await embed();
      const doc = frame.contentDocument as Document;

      // Act
      applyAppStyles(frame, document);
      // Compodoc's own script turning dark from prefers-color-scheme
      doc.body.classList.add('dark');

      // Assert
      await vi.waitFor(() => expect(doc.body.classList).not.toContain('dark'));
    });
  });

  it('leaves a page alone that it cannot reach', () => {
    // Arrange: a cross-origin frame throws on contentDocument
    const frame = {
      get contentDocument(): Document {
        throw new DOMException('cross-origin', 'SecurityError');
      },
    } as unknown as HTMLIFrameElement;
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');

    // Act
    const apply = () => applyAppStyles(frame, document);

    // Assert
    expect(apply).not.toThrow();
  });

  it('leaves a frame alone that has no page yet', () => {
    // Arrange: not in the document, so it has no content document
    const frame = document.createElement('iframe');
    root.style.setProperty('--mat-sys-body-medium-font', 'Goldman, sans-serif');

    // Act
    const apply = () => applyAppStyles(frame, document);

    // Assert
    expect(apply).not.toThrow();
    expect(frame.contentDocument).toBeNull();
  });
});
