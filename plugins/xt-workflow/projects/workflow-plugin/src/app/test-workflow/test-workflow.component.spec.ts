import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestWorkflowComponent } from './test-workflow.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

describe('TestComponent', () => {
  let component: TestWorkflowComponent;
  let fixture: ComponentFixture<TestWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWorkflowComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    })
    .compileComponents();

    const resolverService=TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
    registerDefaultPlugin(resolverService);

    fixture = TestBed.createComponent(TestWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
