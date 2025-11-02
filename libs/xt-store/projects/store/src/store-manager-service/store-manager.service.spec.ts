import { TestBed } from '@angular/core/testing';

import { XtStoreManagerService } from './xt-store-manager.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('StoreManagerService', () => {
  let service: XtStoreManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(XtStoreManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
