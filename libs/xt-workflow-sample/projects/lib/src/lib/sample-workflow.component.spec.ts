import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DcWorkflowModel } from 'dc-workflow';
import { SampleWorkflowComponent } from './sample-workflow.component';

describe('SampleWorkflowComponent', () => {
  let component: SampleWorkflowComponent;
  let fixture: ComponentFixture<SampleWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleWorkflowComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SampleWorkflowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', {
      entity: 'sample',
      workflow: 'sample',
    } as DcWorkflowModel);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the sample message', () => {
    expect(fixture.nativeElement.textContent).toContain("I'm the Sample Workflow");
  });
});
