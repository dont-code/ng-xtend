import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from './error-handler.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { MessageService } from 'primeng/api';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), MessageService],
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
