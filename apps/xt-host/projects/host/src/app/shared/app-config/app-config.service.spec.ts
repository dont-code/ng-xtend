import { TestBed } from '@angular/core/testing';

import { AppConfigService } from './app-config.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../../globalTestSetup';

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()]
    });
    service = TestBed.inject(AppConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
