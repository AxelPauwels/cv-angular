import { toPeriod } from './period';

describe('toPeriod', () => {
  it('parses ISO strings to dates', () => {
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
    expect(toPeriod({ start: '2020-01-01T00:00:00.000Z', end: null })).toEqual({
      start: new Date('2020-01-01T00:00:00.000Z'),
    });
  });
});
