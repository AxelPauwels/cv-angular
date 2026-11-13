import { TestBed } from '@angular/core/testing';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { CvMfe } from './cv-mfe';

// no real remote: the element is created without being defined
vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn(() => Promise.resolve({})),
}));

describe('CvMfe', () => {
  async function render(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(CvMfe);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    let element: (HTMLElement & Record<string, unknown>) | null = null;
    await vi.waitFor(async () => {
      await fixture.whenStable();
      element = fixture.nativeElement.querySelector('cv-mfe');
      expect(element).toBeTruthy();
    });
    await fixture.whenStable();
    return {
      fixture,
      element: element as unknown as HTMLElement & Record<string, unknown>,
    };
  }

  it('loads the cv-mfe remote', async () => {
    // Act
    await render();

    // Assert
    expect(loadRemoteModule).toHaveBeenCalledWith('cv-mfe', './web-components');
  });

  it('passes the inputs that are set to the element', async () => {
    // Act
    const { element } = await render({
      snippet: 'const a = 1;',
      language: 'typescript',
      lineNumbers: false,
    });

    // Assert
    expect(element['snippet']).toBe('const a = 1;');
    expect(element['language']).toBe('typescript');
    expect(element['lineNumbers']).toBe(false);
  });

  it('leaves the inputs that are not set to the remote defaults', async () => {
    // Act
    const { element } = await render({ snippet: 'const a = 1;' });

    // Assert
    expect('copyable' in element).toBe(false);
  });
});
