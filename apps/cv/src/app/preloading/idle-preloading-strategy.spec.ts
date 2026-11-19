import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IdlePreloadingStrategy } from './idle-preloading-strategy';

describe('IdlePreloadingStrategy', () => {
  let idleCallbacks: (() => void)[];

  beforeEach(() => {
    idleCallbacks = [];
    // the test document has already loaded; only the idle moment is awaited
    vi.spyOn(window, 'requestIdleCallback').mockImplementation((callback) => {
      idleCallbacks.push(() => callback({} as IdleDeadline));
      return idleCallbacks.length;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('waits for an idle moment before it loads any route', () => {
    // Arrange
    const strategy = TestBed.inject(IdlePreloadingStrategy);
    const loaded: string[] = [];
    const load = (name: string) => () => {
      loaded.push(name);
      return of(name);
    };

    // Act
    strategy.preload({ path: 'a' }, load('a')).subscribe();
    strategy.preload({ path: 'b' }, load('b')).subscribe();

    // Assert: nothing yet, and one idle callback shared by both routes
    expect(loaded).toEqual([]);
    expect(idleCallbacks).toHaveLength(1);
    idleCallbacks[0]();
    return vi.waitFor(() => expect(loaded).toEqual(['a', 'b']));
  });

  it('loads routes asked for after the idle moment without waiting again', async () => {
    // Arrange
    const strategy = TestBed.inject(IdlePreloadingStrategy);
    strategy.preload({ path: 'a' }, () => of('a')).subscribe();
    idleCallbacks[0]();
    await vi.waitFor(() => expect(idleCallbacks).toHaveLength(1));
    const loaded: string[] = [];

    // Act
    strategy
      .preload({ path: 'later' }, () => {
        loaded.push('later');
        return of('later');
      })
      .subscribe();

    // Assert
    await vi.waitFor(() => expect(loaded).toEqual(['later']));
    expect(idleCallbacks).toHaveLength(1);
  });
});
