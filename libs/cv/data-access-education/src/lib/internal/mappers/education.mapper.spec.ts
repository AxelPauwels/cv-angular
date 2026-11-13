import {
  toAdditionalLearning,
  toCertificate,
  toTraining,
} from './education.mapper';

describe('education mapper', () => {
  it('maps a certificate with its link', () => {
    // Arrange
    const dto = {
      uuid: 'c1',
      name: 'Angular',
      url: 'https://cert.example/1',
      issuer: 'Google',
      year: 2024,
    };

    // Act
    const certificate = toCertificate(dto);

    // Assert
    expect(certificate).toEqual({
      id: 'c1',
      name: 'Angular',
      issuer: 'Google',
      year: 2024,
      url: 'https://cert.example/1',
    });
  });

  it('leaves the link out of a certificate without one', () => {
    // Arrange
    const dto = {
      uuid: 'c2',
      name: 'Scrum',
      url: null,
      issuer: 'Scrum.org',
      year: 2020,
    };

    // Act
    const certificate = toCertificate(dto);

    // Assert
    expect(certificate).not.toHaveProperty('url');
  });

  it('leaves out the provider and year a training does not have', () => {
    // Arrange
    const dto = {
      uuid: 't1',
      name: 'Conference',
      provider: null,
      year: null,
      status: 'RECURRING',
    } as Parameters<typeof toTraining>[0];

    // Act
    const training = toTraining(dto);

    // Assert
    expect(training).toEqual({
      id: 't1',
      name: 'Conference',
      status: 'RECURRING',
    });
  });

  it('maps an additional learning', () => {
    // Arrange
    const dto = {
      uuid: 'a1',
      name: 'Udemy',
      url: 'https://udemy.example',
    } as Parameters<typeof toAdditionalLearning>[0];

    // Act
    const learning = toAdditionalLearning(dto);

    // Assert
    expect(learning).toEqual({
      id: 'a1',
      name: 'Udemy',
      url: 'https://udemy.example',
    });
  });
});
