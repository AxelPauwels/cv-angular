import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Lordicon } from './lordicon';

@Component({
  imports: [Lordicon],
  template: `
    <a href="mailto:me@example.com">
      <ds-lordicon icon="mail"><span class="placeholder"></span></ds-lordicon>
      Email
    </a>
  `,
})
class Host {}

describe('Lordicon', () => {
  async function render(fixture: ComponentFixture<Host>) {
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector(
      'ds-lordicon'
    ) as HTMLElement;
    const icon = host.querySelector('lord-icon') as HTMLElement;
    return { host, icon };
  }

  it('plays only on hover or focus of the link around it, from a self-hosted file', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    const { icon } = await render(fixture);

    // Assert
    expect(icon.getAttribute('trigger')).toBe('hover');
    expect(icon.getAttribute('target')).toBe('a, button');
    expect(icon.hasAttribute('intro')).toBe(false);
    expect(icon.getAttribute('loading')).toBe('lazy');
    expect(icon.getAttribute('src')).toBe('assets/lordicon/icuxkywm.json');
  });

  it.each([
    ['layers', 'noncoqhc'],
    ['code-branch', 'zkiskfnp'],
    ['terminal', 'eeolefdw'],
    ['mail', 'icuxkywm'],
    ['linkedin', 'bnzbstbp'],
    ['github', 'acgiczyg'],
  ] as const)('loads the %s icon from its own file', async (name, file) => {
    // Arrange
    const fixture = TestBed.createComponent(Lordicon);
    fixture.componentRef.setInput('icon', name);

    // Act
    await fixture.whenStable();

    // Assert
    const icon = (fixture.nativeElement as HTMLElement).querySelector(
      'lord-icon'
    );
    expect(icon?.getAttribute('src')).toBe(`assets/lordicon/${file}.json`);
  });

  it('loads the thick copy of the icon only when asked to', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Lordicon);
    fixture.componentRef.setInput('icon', 'layers');
    fixture.componentRef.setInput('thick', true);

    // Act
    await fixture.whenStable();

    // Assert
    const icon = (fixture.nativeElement as HTMLElement).querySelector(
      'lord-icon'
    );
    expect(icon?.getAttribute('src')).toBe(
      'assets/lordicon/noncoqhc.thick.json'
    );
  });

  it('is hidden from screen readers and keeps its placeholder until ready', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    const { host, icon } = await render(fixture);

    // Assert
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('.placeholder')).not.toBeNull();
  });
});
