import { translateKeys } from './translate-keys';

describe('translateKeys', () => {
  it('translates keys anywhere in the data and leaves other values', () => {
    // Arrange
    const data = {
      position: 't.position',
      employer: 'Sopra Steria',
      stack: ['Angular', 't.other'],
      years: 3,
      nested: { profile: 't.profile', client: undefined },
    };
    const texts: Record<string, string> = {
      't.position': 'Developer',
      't.profile': 'Profile',
    };

    // Act
    const translated = translateKeys(data, (key) => texts[key] ?? key);

    // Assert
    expect(translated).toEqual({
      position: 'Developer',
      employer: 'Sopra Steria',
      stack: ['Angular', 't.other'],
      years: 3,
      nested: { profile: 'Profile', client: undefined },
    });
  });
});
