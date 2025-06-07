import { TestBed } from '@angular/core/testing';

import { ApplicationModelManagerService } from './application-model-manager.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('ApplicationModelManagerService', () => {
  let service: ApplicationModelManagerService;

  beforeAll( () => {
    setupAngularTestBed();
  });

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
