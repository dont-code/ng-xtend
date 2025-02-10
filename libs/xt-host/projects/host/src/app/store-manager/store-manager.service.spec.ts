import { TestBed } from '@angular/core/testing';

import { StoreManagerService } from './store-manager.service';

describe('StoreManagerService', () => {
  let service: StoreManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
