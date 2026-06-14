import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';

import { WfwRender } from './wfw-render';
import { WfwResolverService } from '../angular/wfw-resolver-service';
import { XtResolvedComponent } from 'xt-components';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractDcWorkflow } from 'dc-workflow';

@Component({
  selector: 'mock-workflow',
  template: '',
  standalone: true,
})
class MockWorkflowComponent extends AbstractDcWorkflow{
  //config = input<DcWorkflowModel>();
}

@Component({
  selector: 'mock-workflow-alt',
  template: '',
  standalone: true,
})
class MockWorkflowAltComponent extends AbstractDcWorkflow {
  //config = input<DcWorkflowModel>();
}

describe('WfwRender', () => {
  let component: WfwRender<unknown>;
  let fixture: ComponentFixture<WfwRender<unknown>>;
  let findBestWorkflowSpy: any;

  beforeEach(async () => {
    findBestWorkflowSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [WfwRender],
      providers: [
        {
          provide: WfwResolverService,
          useValue: { findBestWorkflow: findBestWorkflowSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WfwRender);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use workflowType when provided', () => {
    fixture.componentRef.setInput('workflowType', MockWorkflowComponent);
    fixture.detectChanges();
    expect(component.type()).toBe(MockWorkflowComponent);
  });

  it('should resolve via resolver when only workflowConfig is provided', () => {
    const config: DcWorkflowModel = { entity: 'test', workflow: 'list-detail' };
    findBestWorkflowSpy.mockReturnValue(new XtResolvedComponent('mock', MockWorkflowComponent));

    fixture.componentRef.setInput('workflowConfig', config);
    fixture.detectChanges();

    expect(component.type()).toBe(MockWorkflowComponent);
    expect(findBestWorkflowSpy).toHaveBeenCalledWith(config);
  });

  it('should return null type when no inputs are provided', () => {
    fixture.detectChanges();
    expect(component.type()).toBeNull();
  });

  it('should prefer workflowType over workflowConfig when both are provided', () => {
    const config: DcWorkflowModel = { entity: 'test', workflow: 'list-detail' };
    fixture.componentRef.setInput('workflowType', MockWorkflowComponent);
    fixture.componentRef.setInput('workflowConfig', config);
    fixture.detectChanges();

    expect(component.type()).toBe(MockWorkflowComponent);
    expect(findBestWorkflowSpy).not.toHaveBeenCalled();
  });

  it('should return null when resolver returns null for workflowConfig', () => {
    const config: DcWorkflowModel = { entity: 'test', workflow: 'list-detail' };
    findBestWorkflowSpy.mockReturnValue(null);

    fixture.componentRef.setInput('workflowConfig', config);
    fixture.detectChanges();

    expect(component.type()).toBeNull();
    expect(findBestWorkflowSpy).toHaveBeenCalledWith(config);
  });
});
