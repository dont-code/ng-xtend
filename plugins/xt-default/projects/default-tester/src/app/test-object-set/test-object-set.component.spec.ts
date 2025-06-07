import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectSetComponent } from './test-object-set.component';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { registerDefaultPlugin } from '../../../../default/src/lib/register';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('TestObjectSetComponent', () => {
  let component: TestObjectSetComponent;
  let fixture: ComponentFixture<TestObjectSetComponent>;

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestObjectSetComponent],
      providers: [provideNoopAnimations(), provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));

    fixture = TestBed.createComponent(TestObjectSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
