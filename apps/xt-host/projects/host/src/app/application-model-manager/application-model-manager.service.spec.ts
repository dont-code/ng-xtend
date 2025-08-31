import { TestBed } from '@angular/core/testing';

import { ApplicationModelManagerService } from './application-model-manager.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('ApplicationModelManagerService', () => {
  let service: ApplicationModelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(ApplicationModelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
