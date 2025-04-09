import { TestBed } from '@angular/core/testing';

import { StoreManagerService } from './store-manager.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('StoreManagerService', () => {
  let service: StoreManagerService;

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
