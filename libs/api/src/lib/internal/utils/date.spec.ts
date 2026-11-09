import { fromDate, fromYear } from './date';

describe('date', () => {
  describe('fromYear', () => {
    it('returns the start of the year in UTC', () => {
      // Arrange
      const year = '2020';

      // Act
      const date = fromYear(year);

      // Assert
      expect(date.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it.each(['20', '20200', 'abcd', '2020-01'])(
      'rejects "%s", which is not a year',
      (year) => {
        // Arrange
        const parse = () => fromYear(year as `${number}`);

        // Act & Assert
        expect(parse).toThrow(`Invalid year: ${year}. Expected "YYYY".`);
      }
    );
  });

  describe('fromDate', () => {
    it('returns midnight of the day in UTC', () => {
      // Arrange
      const day = '2020-03-15';

      // Act
      const date = fromDate(day);

      // Assert
      expect(date.toISOString()).toBe('2020-03-15T00:00:00.000Z');
    });

    it.each(['2020-3-15', '15-03-2020', '2020-03-15T10:00', '2020'])(
      'rejects "%s", which is not a date',
      (day) => {
        // Arrange
        const parse = () => fromDate(day as `${number}-${number}-${number}`);

        // Act & Assert
        expect(parse).toThrow(`Invalid date: ${day}. Expected "YYYY-MM-DD".`);
      }
    );
  });
});
