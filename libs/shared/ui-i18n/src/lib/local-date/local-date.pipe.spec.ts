import { LocalDatePipe } from './local-date.pipe';

describe('LocalDatePipe', () => {
  const date = new Date(1986, 0, 2);

  it.each([
    ['en', 'January 2, 1986'],
    ['nl', '2 januari 1986'],
    ['es', '2 de enero de 1986'],
    ['el', '2 Ιανουαρίου 1986'],
  ])('formats a long date in %s', (language, expected) => {
    // Arrange
    const pipe = new LocalDatePipe();

    // Act
    const formatted = pipe.transform(date, language);

    // Assert
    expect(formatted).toBe(expected);
  });

  it('accepts another date style', () => {
    // Arrange
    const pipe = new LocalDatePipe();

    // Act
    const formatted = pipe.transform(date, 'nl', 'short');

    // Assert
    expect(formatted).toBe('02-01-1986');
  });

  it('shows nothing without a date', () => {
    // Arrange
    const pipe = new LocalDatePipe();

    // Act
    const formatted = pipe.transform(null, 'en');

    // Assert
    expect(formatted).toBe('');
  });
});
