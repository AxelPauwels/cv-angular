import { isQuotaError } from './firebase-ai-transport';

describe('isQuotaError', () => {
  it('recognises Gemini running out of its quota', () => {
    // Arrange
    const sdkError = Object.assign(
      new Error('[429 ] You exceeded your quota'),
      {
        customErrorData: { status: 429 },
      }
    );

    // Act & Assert
    expect(isQuotaError(sdkError)).toBe(true);
    expect(isQuotaError(new Error('RESOURCE_EXHAUSTED'))).toBe(true);
  });

  it('leaves other errors alone', () => {
    expect(isQuotaError(new Error('Network error'))).toBe(false);
    expect(isQuotaError('429')).toBe(false);
  });
});
