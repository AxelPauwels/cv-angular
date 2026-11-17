import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { CvKnowledgeService } from './cv-knowledge.service';

describe('CvKnowledgeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  it('reads the references from the API, without phone numbers', async () => {
    // Arrange
    const knowledge = TestBed.inject(CvKnowledgeService);

    // Act
    const references = await knowledge.references();

    // Assert
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(reference).not.toHaveProperty('phoneNumber');
      expect(reference.period.start).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it('reads the profile, experiences, skills and education', async () => {
    // Arrange
    const knowledge = TestBed.inject(CvKnowledgeService);

    // Act
    const [profile, experiences, skills, education] = await Promise.all([
      knowledge.profile(),
      knowledge.experiences(),
      knowledge.skills(),
      knowledge.education(),
    ]);

    // Assert
    expect(profile.name).toContain('Axel');
    expect(profile).not.toHaveProperty('contact');
    expect(profile.location.city).toBeTruthy();
    expect(profile.location.country).toMatch(/^t\.country\./);
    expect(JSON.stringify(profile)).not.toMatch(/street|postalCode/);
    expect(experiences.some(({ category }) => category === 'IT')).toBe(true);
    expect(skills.categories.length).toBeGreaterThan(0);
    expect(education.educations.length).toBeGreaterThan(0);
  });
});
