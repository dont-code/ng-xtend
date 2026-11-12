import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { XtResolverService } from 'xt-components';
import { SampleWorkflowComponent } from './sample-workflow.component';
import { registerWorkflowSamplePlugin, SAMPLE_WORKFLOW_TYPE } from './register';

describe('registerWorkflowSamplePlugin', () => {
  it('should register the sample workflow', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const resolver = TestBed.inject(XtResolverService);

    expect(registerWorkflowSamplePlugin(resolver)).toBe(true);

    const workflows = resolver.pluginRegistry.listWorkflowsForType(SAMPLE_WORKFLOW_TYPE);
    expect(workflows.length).toBe(1);
    expect(workflows[0].class).toBe(SampleWorkflowComponent);
  });
});
