import { TestBed } from '@angular/core/testing';
import { Wrapper } from './wrapper';

// no real remote: the element is created without being defined
vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn(() => Promise.resolve({})),
}));

describe('Wrapper', () => {
  it('renders nothing until it gets a remote config', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Wrapper);

    // Act
    await fixture.whenStable();

    // Assert
    expect(fixture.nativeElement.children.length).toBe(0);
  });

  it('sets the inputs as properties on the remote element', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Wrapper);
    fixture.componentRef.setInput('config', {
      remoteName: 'remote',
      exposedModule: './web-components',
      elementName: 'test-remote',
    });
    fixture.componentRef.setInput('inputs', { name: 'Ada', items: [1, 2] });

    // Act
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('test-remote')).toBeTruthy();
    });
    await fixture.whenStable();

    // Assert
    const element = fixture.nativeElement.querySelector('test-remote');
    expect(element.name).toBe('Ada');
    expect(element.items).toEqual([1, 2]);

    // Act: new values are set again
    fixture.componentRef.setInput('inputs', { name: 'Grace' });
    await fixture.whenStable();

    // Assert
    expect(element.name).toBe('Grace');
  });
});
