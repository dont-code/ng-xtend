import { TestBed } from '@angular/core/testing';

import { WfwResolverService } from './wfw-resolver-service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('WfwResolverService', () => {
  let service: WfwResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WfwResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
