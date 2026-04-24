import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { GoogleIdentityService } from './google-identity.service';

const googleIdentityServiceMock = {
  isConfigured: () => true,
  load: () => Promise.resolve(),
  initialize: () => undefined,
  renderButton: () => undefined,
  disableAutoSelect: () => undefined,
};

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GoogleIdentityService, useValue: googleIdentityServiceMock },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render the application title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('APIFamilia');
  });
});
