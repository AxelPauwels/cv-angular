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

  it('offers the fonts, starting with Red Hat Display', () => {
    // Arrange
    const root = TestBed.inject(DOCUMENT).documentElement;

    // Act
    const { service } = start();

    // Assert
    expect(service.fonts.map((font) => font.id)).toEqual([
      'red-hat',
      'michroma',
      'goldman',
      'syncopate',
      'bruno-ace',
    ]);
    expect(root.dataset['font']).toBe('red-hat');
  });

  it('switches the font on <html> and remembers it', () => {
    // Arrange
    const { service, root } = start();

    // Act
    service.changeFont('goldman');
    TestBed.tick();

    // Assert
    expect(root.dataset['font']).toBe('goldman');
    expect(localStorage.getItem('cv-font')).toBe('goldman');
  });

  it('restores a saved choice', () => {
    // Arrange
    localStorage.setItem('cv-font', 'michroma');

    // Act
    const { service } = start();

    // Assert
    expect(service.font()).toBe('michroma');
  });

  it('ignores an unknown saved choice', () => {
    // Arrange
    localStorage.setItem('cv-font', 'comic-sans');

    // Act
    const { service } = start();

    // Assert
    expect(service.font()).toBe('red-hat');
  });

  it('resets to Red Hat Display and forgets the choice', () => {
    // Arrange
    const { service, root } = start();
    service.changeFont('syncopate');
    TestBed.tick();

    // Act
    service.resetFont();
    TestBed.tick();

    // Assert
    expect(root.dataset['font']).toBe('red-hat');
    expect(localStorage.getItem('cv-font')).toBeNull();
  });
});
