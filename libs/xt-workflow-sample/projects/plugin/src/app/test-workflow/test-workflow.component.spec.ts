import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { XtResolverService } from 'xt-components';
import { WfwRender } from 'dc-workflow';
import { TestWorkflowComponent } from './test-workflow.component';
import { registerWorkflowSamplePlugin } from '../../../../lib/src/lib/register';

describe('TestWorkflowComponent', () => {
  let component: TestWorkflowComponent;
  let fixture: ComponentFixture<TestWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWorkflowComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()],
    }).compileComponents();

    registerWorkflowSamplePlugin(TestBed.inject(XtResolverService));

    fixture = TestBed.createComponent(TestWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the sample workflow', async () => {
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.directive(WfwRender))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain("I'm the Sample Workflow");
  });
});
