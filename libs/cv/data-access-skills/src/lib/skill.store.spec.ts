import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { SkillStore } from './skill.store';

describe('SkillStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  it('has no skills before they have loaded', () => {
    // Arrange
    const store = TestBed.inject(SkillStore);

    // Act
    const skills = store.skills();

    // Assert
    expect(skills).toEqual([]);
  });

  it('exposes the skills', async () => {
    // Arrange
    const store = TestBed.inject(SkillStore);

    // Act
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(store.error()).toBeUndefined();
    expect(store.skills().length).toBeGreaterThan(0);
  });

  it('keeps the result for the next consumer', async () => {
    // Arrange
    TestBed.inject(SkillStore);

    // Act
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(SkillStore).isLoading()).toBe(false);
  });
});
