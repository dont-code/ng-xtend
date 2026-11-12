import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractDcWorkflowBase } from 'dc-workflow';

/**
 * The simplest possible workflow.
 *
 * It extends `AbstractDcWorkflowBase` (from `dc-workflow`), which already declares
 * the required `config` input, and only adds a template. This is the whole component.
 *
 * Copy this package to create a new workflow and follow the
 * "Turn the sample into your own workflow" section in the package README.
 */
@Component({
  selector: 'wfw-sample-workflow',
  imports: [],
  template: `<p>I'm the Sample Workflow</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleWorkflowComponent extends AbstractDcWorkflowBase {}
