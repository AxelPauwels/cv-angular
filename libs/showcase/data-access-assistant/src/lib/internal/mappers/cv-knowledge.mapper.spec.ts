import {
  toAssistantPeriod,
  toAssistantReferences,
} from './cv-knowledge.mapper';

describe('cv knowledge mappers', () => {
  it('shortens periods to months and leaves out a missing end', () => {
    // Act
    const ongoing = toAssistantPeriod({
      start: '2021-03-01T00:00:00.000Z',
      end: null,
    });
    const ended = toAssistantPeriod({
      start: '2019-01-01T00:00:00.000Z',
      end: '2020-06-01T00:00:00.000Z',
    });

    // Assert
    expect(ongoing).toEqual({ start: '2021-03' });
    expect(ended).toEqual({ start: '2019-01', end: '2020-06' });
  });

  it('maps references without a client to a missing client', () => {
    // Act
    const [reference] = toAssistantReferences({
      references: [
        {
          uuid: 'id',
          name: 'Roel Frison',
          function: 'Lead',
          work: 'Employer',
          client: null,
          workCategory: 'IT',
          workCategoryPeriod: { start: '2022-01-01T00:00:00.000Z', end: null },
        },
      ],
    });

    // Assert
    expect(reference).toEqual({
      id: 'id',
      name: 'Roel Frison',
      function: 'Lead',
      employer: 'Employer',
      client: undefined,
      category: 'IT',
      period: { start: '2022-01' },
    });
  });
});
