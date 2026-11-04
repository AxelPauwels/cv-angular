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

  it('exposes the skills', async () => {
    const store = TestBed.inject(SkillStore);
    expect(store.skills()).toEqual([]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeUndefined();
    expect(store.skills().length).toBeGreaterThan(0);
  });

  it('keeps the result for the next consumer', async () => {
    TestBed.inject(SkillStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(SkillStore).isLoading()).toBe(false);
  });
});
