import { TestBed } from '@angular/core/testing';

import { ApplicationModelManagerService } from './application-model-manager.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ApplicationModelManagerService', () => {
  let service: ApplicationModelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()]
    });
    service = TestBed.inject(ApplicationModelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
