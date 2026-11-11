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

    it('returns a new date on every call, so callers cannot share one', () => {
      // Arrange
      const year = '2020';
      const first = fromYear(year);

      // Act
      first.setUTCMonth(6);
      const second = fromYear(year);

      // Assert
      expect(second.toISOString()).toBe('2020-01-01T00:00:00.000Z');
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

    it('accepts the leap day of a leap year', () => {
      // Arrange
      const leapDay = '2024-02-29';

      // Act
      const date = fromDate(leapDay);

      // Assert
      expect(date.toISOString()).toBe('2024-02-29T00:00:00.000Z');
    });

    it.each([
      '2021-02-29',
      '2021-02-30',
      '2020-04-31',
      '2020-13-01',
      '2020-00-10',
      '2020-01-00',
      '2020-01-32',
    ])('rejects "%s", which is no day of the calendar', (day) => {
      // Arrange
      const parse = () => fromDate(day as `${number}-${number}-${number}`);

      // Act & Assert
      expect(parse).toThrow(`Invalid date: ${day}. No such day.`);
    });

    it('returns the same day whatever the local time zone', () => {
      // Arrange
      const day = '2020-12-31';

      // Act
      const date = fromDate(day);

      // Assert
      expect(date.getUTCFullYear()).toBe(2020);
      expect(date.getUTCMonth()).toBe(11);
      expect(date.getUTCDate()).toBe(31);
      expect(date.getUTCHours()).toBe(0);
    });

    it('returns a new date on every call, so callers cannot share one', () => {
      // Arrange
      const day = '2020-03-15';
      const first = fromDate(day);

      // Act
      first.setUTCFullYear(1999);
      const second = fromDate(day);

      // Assert
      expect(second.toISOString()).toBe('2020-03-15T00:00:00.000Z');
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
