import { TestBed } from '@angular/core/testing';
import { Wrapper } from './wrapper';

describe('Wrapper', () => {
  it('renders nothing until it gets a remote config', async () => {
    const fixture = TestBed.createComponent(Wrapper);
    await fixture.whenStable();
    expect(fixture.nativeElement.children.length).toBe(0);
  });
});
