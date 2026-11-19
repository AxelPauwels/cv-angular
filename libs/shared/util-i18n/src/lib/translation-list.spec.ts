import {
  splitTranslationList,
  TRANSLATION_LIST_DELIMITER,
} from './translation-list';

describe('splitTranslationList', () => {
  it('splits on the delimiter and trims every item', () => {
    // Arrange
    const text = `First.${TRANSLATION_LIST_DELIMITER} Second. ||Third.`;

    // Act
    const items = splitTranslationList(text);

    // Assert
    expect(items).toEqual(['First.', 'Second.', 'Third.']);
  });

  it('keeps a single pipe, which ordinary texts use', () => {
    // Arrange & Act
    const items = splitTranslationList('Pulled sugar | Blown sugar');

    // Assert
    expect(items).toEqual(['Pulled sugar | Blown sugar']);
  });

  it('drops empty items, for a trailing delimiter or an empty text', () => {
    // Arrange & Act & Assert
    expect(splitTranslationList('One.||')).toEqual(['One.']);
    expect(splitTranslationList('')).toEqual([]);
  });
});
