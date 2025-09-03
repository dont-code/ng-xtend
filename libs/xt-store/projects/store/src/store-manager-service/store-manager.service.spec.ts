import { TestBed } from '@angular/core/testing';

import { StoreManagerService } from './store-manager.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('StoreManagerService', () => {
  let service: StoreManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(StoreManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
