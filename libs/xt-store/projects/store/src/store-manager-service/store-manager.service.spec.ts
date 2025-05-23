import { TestBed } from '@angular/core/testing';

import { StoreManagerService } from './store-manager.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../globalTestSetup';

describe('StoreManagerService', () => {
  let service: StoreManagerService;

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()]
    });
    service = TestBed.inject(StoreManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
