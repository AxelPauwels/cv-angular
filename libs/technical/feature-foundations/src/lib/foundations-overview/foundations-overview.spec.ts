import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import {
  FoundationsOverview,
  ICON_SAMPLES,
  LORDICON_SAMPLES,
  MATERIAL_SAMPLES,
  STORES,
  STYLE_LAYERS,
} from './foundations-overview';

const texts = (parent: Element, selector: string) =>
  Array.from(parent.querySelectorAll(selector)).map((node) =>
    node.textContent?.replace(/\s+/g, ' ').trim()
  );

describe('FoundationsOverview', () => {
  async function render(): Promise<HTMLElement> {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    const fixture = TestBed.createComponent(FoundationsOverview);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('has one page title and a named section per foundation', async () => {
    // Arrange
    const element = await render();

    // Act
    const sections = Array.from(element.querySelectorAll('section'));

    // Assert
    expect(texts(element, 'h1')).toEqual(['Frontend foundations']);
    expect(sections.map((s) => s.getAttribute('aria-labelledby'))).toEqual([
      'foundations-itcss-title',
      'foundations-icons-title',
      'foundations-state-title',
    ]);
    for (const section of sections) {
      const id = section.getAttribute('aria-labelledby') ?? '';
      expect(element.querySelector(`#${id}`)?.tagName).toBe('H2');
    }
  });

  it('lists the ITCSS layers in import order, with their name and class prefix', async () => {
    // Arrange
    const element = await render();

    // Act
    const names = texts(element, '.foundations-overview__layer-name');
    const bars = Array.from(
      element.querySelectorAll('.foundations-overview__bar')
    );

    // Assert
    expect(names).toHaveLength(STYLE_LAYERS.length);
    expect(names[0]).toBe('Settings');
    expect(names.at(-1)).toBe('Utilities');
    expect(names.every((name) => name && !name.startsWith('t.'))).toBe(true);
    expect(
      bars.map(
        (bar) =>
          bar.querySelector('.foundations-overview__namespace')?.textContent
      )
    ).toEqual(
      STYLE_LAYERS.map((layer) =>
        layer.namespace ? `.${layer.namespace}*` : undefined
      )
    );
  });

  it('has a card per icon source, each with an equal, decorative sample', async () => {
    // Arrange
    const element = await render();

    // Act
    const cards = Array.from(
      element.querySelectorAll('.foundations-overview__font')
    );
    const samples = cards.map((card) =>
      card.querySelector('.foundations-overview__glyphs')
    );
    const [icomoon, material, lordicon] = samples.map((sample) =>
      Array.from(sample?.children ?? [])
    );

    // Assert
    // the name after the decorative icon (whose ligature is its text)
    expect(
      cards.map((card) =>
        card.querySelector('dt')?.lastChild?.textContent?.trim()
      )
    ).toEqual(['Icomoon', 'Material Symbols', 'Lordicon']);
    expect(
      samples.map((sample) => sample?.getAttribute('aria-hidden'))
    ).toEqual(['true', 'true', 'true']);
    expect(icomoon.map((glyph) => glyph.className)).toEqual(
      ICON_SAMPLES.map((icon) =>
        expect.stringContaining(`cv-icon-${icon.name}`)
      )
    );
    expect(material.map((glyph) => glyph.textContent?.trim())).toEqual(
      MATERIAL_SAMPLES.map((icon) => icon.icon)
    );
    expect(material).toHaveLength(icomoon.length);
    expect(lordicon).toHaveLength(icomoon.length);
  });

  it('shows the thick Lordicons, playing on hover', async () => {
    // Arrange
    const element = await render();

    // Act
    const lordicon = element.querySelectorAll('.foundations-overview__font')[2];
    const icons = Array.from(
      lordicon.querySelectorAll('ds-lordicon lord-icon')
    );

    // Assert
    expect(
      texts(lordicon, '.foundations-overview__font-description')[0]
    ).toContain('Animated icons');
    expect(icons).toHaveLength(LORDICON_SAMPLES.length);
    for (const icon of icons) {
      // each plays while the icon itself is hovered: there is no link around it
      expect(icon.getAttribute('trigger')).toBe('hover');
      expect(icon.getAttribute('target')).toBe('ds-lordicon');
      // only here the thick copies: the footer keeps the originals
      expect(icon.getAttribute('src')).toMatch(/\.thick\.json$/);
    }
  });

  it('lists the stores and gives the DevTools placeholder an alt text', async () => {
    // Arrange
    const element = await render();

    // Act
    const image = element.querySelector('figure img');

    // Assert
    expect(texts(element, '.foundations-overview__stores code')).toEqual([
      ...STORES,
    ]);
    expect(image?.getAttribute('alt')).toContain('Redux DevTools');
    expect(image?.getAttribute('loading')).toBe('lazy');
  });
});
