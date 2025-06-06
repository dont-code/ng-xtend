import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponent } from './test.component';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { registerDefaultPlugin } from '../../../../default/src/lib/register';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideNoopAnimations(), provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
