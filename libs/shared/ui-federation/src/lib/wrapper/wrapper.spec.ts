import { TestBed } from '@angular/core/testing';
import { Wrapper } from './wrapper';

describe('Wrapper', () => {
  it('renders nothing until it gets a remote config', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Wrapper);

    // Act
    await fixture.whenStable();

    // Assert
    expect(fixture.nativeElement.children.length).toBe(0);
  });
});
