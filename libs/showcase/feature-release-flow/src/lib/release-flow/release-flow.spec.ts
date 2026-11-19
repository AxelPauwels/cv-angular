import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { ReleaseFlow } from './release-flow';

describe('ReleaseFlow', () => {
  async function render(): Promise<HTMLElement> {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    const fixture = TestBed.createComponent(ReleaseFlow);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('explains the skill, then each phase of the release flow', async () => {
    // Arrange & Act
    const element = await render();

    // Assert
    expect(element.querySelectorAll('ds-card')).toHaveLength(5);
    expect(element.textContent).toContain(
      'A Claude Code skill runs my releases'
    );
    expect(element.textContent).toContain('Push and fix develop');
    expect(element.textContent).toContain('Choose the version');
    expect(element.textContent).toContain('Release branch and pull request');
    expect(element.textContent).toContain('Merge, tag and sync');
  });

  it('renders inline code and emphasis as elements, not as markup text', async () => {
    // Arrange & Act
    const element = await render();

    // Assert
    expect(element.textContent).not.toContain('<code>');
    expect(element.textContent).not.toContain('<strong>');
    expect(
      Array.from(element.querySelectorAll('code')).map(
        (code) => code.textContent
      )
    ).toContain('release/x.y.z');
    expect(
      Array.from(element.querySelectorAll('strong')).map(
        (strong) => strong.textContent
      )
    ).toEqual(['Claude Code skill', 'Major', 'Minor', 'Patch']);
  });

  it('numbers the steps of each phase and lists the version bumps', async () => {
    // Arrange & Act
    const element = await render();

    // Assert
    expect(element.querySelectorAll('ol')).toHaveLength(3);
    expect(element.querySelectorAll('ol li')).toHaveLength(12);
    // the guard rails and the three bumps are options, not steps
    expect(element.querySelectorAll('ul li')).toHaveLength(6);
  });

  it('links to the skill and the guide on GitHub, in a new tab', async () => {
    // Arrange & Act
    const element = await render();

    // Assert
    const links = Array.from(element.querySelectorAll('a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://github.com/AxelPauwels/cv-angular/blob/main/.claude/skills/release-flow/SKILL.md',
      'https://github.com/AxelPauwels/cv-angular/blob/main/README.release-by-skills.md',
    ]);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener');
    }
  });
});
