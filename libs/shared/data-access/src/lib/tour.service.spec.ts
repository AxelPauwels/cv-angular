import { TestBed } from '@angular/core/testing';
import { TourService } from './tour.service';

describe('TourService', () => {
  afterEach(() => document.body.replaceChildren());

  it('starts inactive', () => {
    // Arrange
    const tour = TestBed.inject(TourService);

    // Act
    const active = tour.active();

    // Assert
    expect(active).toBe(false);
  });

  it('becomes active with start', () => {
    // Arrange
    const tour = TestBed.inject(TourService);

    // Act
    tour.start();

    // Assert
    expect(tour.active()).toBe(true);
  });

  it('becomes inactive again with stop', () => {
    // Arrange
    const tour = TestBed.inject(TourService);
    tour.start();

    // Act
    tour.stop();

    // Assert
    expect(tour.active()).toBe(false);
  });

  it('gives focus back to the control that started the tour', () => {
    // Arrange
    const tour = TestBed.inject(TourService);
    const opener = document.createElement('button');
    const other = document.createElement('button');
    document.body.append(opener, other);

    // Act
    opener.focus();
    tour.start();
    other.focus();
    tour.stop();

    // Assert
    expect(document.activeElement).toBe(opener);
  });

  it('focuses the re-rendered opener with the same data-tour marker', () => {
    // Arrange
    const tour = TestBed.inject(TourService);
    const opener = document.createElement('button');
    opener.dataset['tour'] = 'start';
    document.body.append(opener);

    // Act
    opener.focus();
    tour.start();
    const replacement = opener.cloneNode() as HTMLButtonElement;
    opener.replaceWith(replacement);
    tour.stop();

    // Assert
    expect(document.activeElement).toBe(replacement);
  });

  it('skips focus when the opener is gone', () => {
    // Arrange
    const tour = TestBed.inject(TourService);
    const opener = document.createElement('button');
    document.body.append(opener);

    // Act
    opener.focus();
    tour.start();
    opener.remove();

    // Assert
    expect(() => tour.stop()).not.toThrow();
  });
});
