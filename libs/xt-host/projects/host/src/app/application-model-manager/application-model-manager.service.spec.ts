import { TestBed } from '@angular/core/testing';

import { ApplicationModelManagerService } from './application-model-manager.service';

describe('ApplicationModelManagerService', () => {
  let service: ApplicationModelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationModelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
