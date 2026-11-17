import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FontService } from './font.service';

describe('FontService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['font'];
  });

  function start() {
    const service = TestBed.inject(FontService);
    TestBed.tick();
    return { service, root: TestBed.inject(DOCUMENT).documentElement };
  }

  it('offers the fonts, starting with Red Hat', () => {
    // Arrange
    const root = TestBed.inject(DOCUMENT).documentElement;

    // Act
    const { service } = start();

    // Assert
    expect(service.fonts.map((font) => font.id)).toEqual([
      'red-hat',
      'roboto',
      'inter',
      'ibm-plex',
      'atkinson',
      'open-sans',
      'nunito',
      'source-serif',
      'lexend',
      'manrope',
    ]);
    expect(root.dataset['font']).toBe('red-hat');
  });

  it('switches the font on <html> and remembers it', () => {
    // Arrange
    const { service, root } = start();

    // Act
    service.changeFont('roboto');
    TestBed.tick();

    // Assert
    expect(root.dataset['font']).toBe('roboto');
    expect(localStorage.getItem('cv-font')).toBe('roboto');
  });

  it('restores a saved choice', () => {
    // Arrange
    localStorage.setItem('cv-font', 'inter');

    // Act
    const { service } = start();

    // Assert
    expect(service.font()).toBe('inter');
  });

  it('ignores an unknown saved choice', () => {
    // Arrange
    localStorage.setItem('cv-font', 'comic-sans');

    // Act
    const { service } = start();

    // Assert
    expect(service.font()).toBe('red-hat');
  });

  it('resets to Red Hat and forgets the choice', () => {
    // Arrange
    const { service, root } = start();
    service.changeFont('ibm-plex');
    TestBed.tick();

    // Act
    service.resetFont();
    TestBed.tick();

    // Assert
    expect(root.dataset['font']).toBe('red-hat');
    expect(localStorage.getItem('cv-font')).toBeNull();
  });
});
