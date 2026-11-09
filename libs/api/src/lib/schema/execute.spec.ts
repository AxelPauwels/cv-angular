import { executeOperation } from './execute';

describe('executeOperation', () => {
  it.each([
    ['educations', '{ educations { level specialization } }'],
    ['experiences', '{ experiences { isInternship } }'],
    ['skills', '{ skills { category icon } }'],
    ['references', '{ references { name work } }'],
    ['certificates', '{ certificates { name issuer year } }'],
    ['additionalLearnings', '{ additionalLearnings { name url } }'],
    ['competences', '{ competences { title description } }'],
    ['trainings', '{ trainings { name status } }'],
  ])('resolves %s from its repository', async (field, query) => {
    // Act
    const result = await executeOperation({ query });

    // Assert
    expect(result.errors).toBeUndefined();
    expect(result.data?.[field]).toEqual(expect.any(Array));
  });

  it('resolves the other skills: names and translation keys', async () => {
    // Act
    const result = await executeOperation({ query: '{ otherSkills }' });

    // Assert
    expect(result.errors).toBeUndefined();
    expect(result.data?.['otherSkills']).toEqual(
      expect.arrayContaining(['PHP', 'React', 't.skill.other.testing'])
    );
  });

  it('resolves the person', async () => {
    // Act
    const result = await executeOperation({
      query: '{ person { firstName lastName } }',
    });

    // Assert
    expect(result.errors).toBeUndefined();
    expect(result.data?.['person']).toEqual(
      expect.objectContaining({ firstName: 'Axel', lastName: 'Pauwels' })
    );
  });

  it('sends periods as ISO date-times', async () => {
    // Act
    const result = await executeOperation({
      query: '{ educations { period { start end } } }',
    });

    // Assert
    // as the client receives it: the response serialized to JSON
    const { data } = JSON.parse(JSON.stringify(result));
    const educations = data.educations as {
      period: { start: string; end: string | null };
    }[];
    expect(result.errors).toBeUndefined();
    expect(educations[0].period.start).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
  });

  it('passes variables and picks the named operation', async () => {
    // Arrange
    const query = `
      query Titles($withDescription: Boolean!) {
        competences { title description @include(if: $withDescription) }
      }
      query Names { trainings { name } }
    `;

    // Act
    const result = await executeOperation({
      query,
      operationName: 'Titles',
      variables: { withDescription: false },
    });

    // Assert
    const competences = result.data?.['competences'] as object[];
    expect(result.errors).toBeUndefined();
    expect(result.data).not.toHaveProperty('trainings');
    expect(competences[0]).toEqual({ title: expect.any(String) });
  });

  it('reports an unknown field as an error, not as data', async () => {
    // Act
    const result = await executeOperation({ query: '{ nope }' });

    // Assert
    expect(result.data).toBeUndefined();
    expect(result.errors?.[0].message).toContain('nope');
  });
});
