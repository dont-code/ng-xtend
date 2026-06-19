import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestWorkflowComponent } from './test-workflow.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { StoreTestBed } from 'xt-store';
import { By } from '@angular/platform-browser';
import { WfwRender } from 'dc-workflow';
import { XtUnitTestHelper } from 'xt-components';
import { registerWorkflowPlugin } from '../../../../workflow/src/lib/register';

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
    registerWorkflowPlugin(resolverService);

    StoreTestBed.ensureMemoryProviderOnly();
    fixture = TestBed.createComponent(TestWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

  });

  it('should render the workflow', async () => {
    await XtUnitTestHelper.waitFor(() => fixture.debugElement.query(By.directive(WfwRender)) != null, 40, 100);

    const ths = fixture.nativeElement.querySelectorAll('th');
    expect(ths.length).toEqual(3);
    expect(Array.from(ths, (v: any) => v.textContent)).toEqual(['name', 'creationDate', 'value']);
  });
});
