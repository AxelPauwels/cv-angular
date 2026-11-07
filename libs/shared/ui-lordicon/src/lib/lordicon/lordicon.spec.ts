import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector(
      'ds-lordicon'
    ) as HTMLElement;
    const icon = host.querySelector('lord-icon') as HTMLElement;
    return { host, icon };
  }

  it('plays only on hover or focus of the link around it, from a self-hosted file', async () => {
    // Arrange & Act
    const { icon } = await render();

    // Assert
    expect(icon.getAttribute('trigger')).toBe('hover');
    expect(icon.getAttribute('target')).toBe('a, button');
    expect(icon.hasAttribute('intro')).toBe(false);
    expect(icon.getAttribute('loading')).toBe('lazy');
    expect(icon.getAttribute('src')).toBe('assets/lordicon/icuxkywm.json');
  });

  it('is hidden from screen readers and keeps its placeholder until ready', async () => {
    // Arrange & Act
    const { host, icon } = await render();

    // Assert
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('.placeholder')).not.toBeNull();
  });
});
