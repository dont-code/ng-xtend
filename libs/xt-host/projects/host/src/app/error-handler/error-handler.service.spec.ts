import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from './error-handler.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
