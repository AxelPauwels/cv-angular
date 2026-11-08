import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideI18nTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    // Arrange
    const component = App;

    // Act
    const fixture = TestBed.createComponent(component);

    // Assert
    expect(fixture.componentInstance).toBeInstanceOf(App);
  });
});
