import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DcWorkflowModel, WfwRender } from 'dc-workflow';

/**
 * Test page for the sample workflow.
 * `wfw-render` resolves the component registered for the `'sample'` workflow
 * type and renders it.
 */
@Component({
  selector: 'app-test-workflow',
  imports: [WfwRender],
  templateUrl: './test-workflow.component.html',
  styleUrl: './test-workflow.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestWorkflowComponent {
  /** Configuration telling `wfw-render` to use the sample workflow. */
  protected readonly workflowConfig: DcWorkflowModel = {
    entity: 'sample',
    workflow: 'sample',
  };
}
