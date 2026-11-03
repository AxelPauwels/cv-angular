import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { Example } from './example';

describe('Example', () => {
  let component: Example;
  let fixture: ComponentFixture<Example>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Example],
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Example);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
