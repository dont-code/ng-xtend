import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectComponent } from './test-object.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerDefaultPlugin } from '../../../../default/src/lib/register';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

describe('TestObjectComponent', () => {
  let component: TestObjectComponent;
  let fixture: ComponentFixture<TestObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestObjectComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));

    fixture = TestBed.createComponent(TestObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
