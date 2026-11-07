import { byEndNewestFirst, toPeriod } from './period';

describe('toPeriod', () => {
  it('parses ISO strings to dates', () => {
    // Act & Assert
    expect(
      toPeriod({
        start: '2020-01-01T00:00:00.000Z',
        end: '2021-06-30T00:00:00.000Z',
      })
    ).toEqual({
      start: new Date('2020-01-01T00:00:00.000Z'),
      end: new Date('2021-06-30T00:00:00.000Z'),
    });
  });

  it('leaves out the end of an ongoing period', () => {
    // Act & Assert
    expect(toPeriod({ start: '2020-01-01T00:00:00.000Z', end: null })).toEqual({
      start: new Date('2020-01-01T00:00:00.000Z'),
    });
  });
});

describe('byEndNewestFirst', () => {
  it('puts ongoing periods first, then the latest end, then the latest start', () => {
    // Arrange
    const ongoing = { start: new Date(2010, 0, 1) };
    const ended2018 = {
      start: new Date(2015, 0, 1),
      end: new Date(2018, 0, 1),
    };
    const alsoEnded2018 = {
      start: new Date(2016, 0, 1),
      end: new Date(2018, 0, 1),
    };
    const ended2020 = {
      start: new Date(2005, 0, 1),
      end: new Date(2020, 0, 1),
    };

    // Act
    const sorted = [ended2018, ongoing, alsoEnded2018, ended2020].sort(
      byEndNewestFirst
    );

    // Assert
    expect(sorted).toEqual([ongoing, ended2020, alsoEnded2018, ended2018]);
  });
});
