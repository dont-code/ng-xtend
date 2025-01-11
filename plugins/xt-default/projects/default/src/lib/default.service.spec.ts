import { TestBed } from '@angular/core/testing';

import { DefaultService } from './default.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('DefaultService', () => {
  let service: DefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()]
    });
    service = TestBed.inject(DefaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
