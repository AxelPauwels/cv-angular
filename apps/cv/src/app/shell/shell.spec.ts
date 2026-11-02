import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

describe('Shell', () => {
  it('lays out header, main and footer with the domain navigation', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    for (const landmark of ['header', 'main', 'footer']) {
      expect(element.querySelector(landmark)).toBeTruthy();
    }
    expect(
      Array.from(element.querySelectorAll('header a')).map((link) =>
        link.textContent?.trim()
      )
    ).toEqual(['CV', 'Showcase', 'Technical']);
    expect(element.querySelector('main router-outlet')).toBeTruthy();
  });
});
