import { TestBed } from '@angular/core/testing';

import { AppConfigService } from './app-config.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()]
    });
    service = TestBed.inject(AppConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
