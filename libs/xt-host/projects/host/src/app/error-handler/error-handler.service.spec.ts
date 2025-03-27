import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from './error-handler.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MessageService } from 'primeng/api';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection(), MessageService],
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
