import {
  withDevtools,
  withDevToolsStub,
} from '@angular-architects/ngrx-toolkit';
import { withDevToolsForDebugMode } from './with-dev-tools-for-debug-mode';

// the real features need a store; these only tell which one was picked
vi.mock('@angular-architects/ngrx-toolkit', () => ({
  withDevtools: vi.fn((name: string) => `devtools:${name}`),
  withDevToolsStub: vi.fn((name: string) => `stub:${name}`),
}));

/** Angular's build-time flag: an object in dev builds, false in production */
const angular = globalThis as { ngDevMode?: unknown };

describe('withDevToolsForDebugMode', () => {
  const devMode = angular.ngDevMode;

  afterEach(() => {
    angular.ngDevMode = devMode;
    vi.clearAllMocks();
  });

  it('connects the store to the Redux DevTools in a development build', () => {
    // Arrange
    angular.ngDevMode = {};

    // Act
    const feature = withDevToolsForDebugMode('education');

    // Assert
    expect(feature).toBe('devtools:education');
    expect(withDevtools).toHaveBeenCalledWith('education');
    expect(withDevToolsStub).not.toHaveBeenCalled();
  });

  it('uses the stub in a production build', () => {
    // Arrange
    angular.ngDevMode = false;

    // Act
    const feature = withDevToolsForDebugMode('education');

    // Assert
    expect(feature).toBe('stub:education');
    expect(withDevToolsStub).toHaveBeenCalledWith('education');
    expect(withDevtools).not.toHaveBeenCalled();
  });
});
