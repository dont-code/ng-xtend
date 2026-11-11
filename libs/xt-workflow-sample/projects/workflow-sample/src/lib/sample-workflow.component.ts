import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SimpleWorkflow } from 'dc-workflow';

/**
 * The simplest possible workflow.
 *
 * It extends `SimpleWorkflow`, which already declares the required `config`
 * input, and only adds a template. This is the whole component.
 *
 * Copy this file to create a new workflow, then register it in `register.ts`.
 */
@Component({
  selector: 'wfw-sample-workflow',
  imports: [],
  template: `<p>I'm the Sample Workflow</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleWorkflowComponent extends SimpleWorkflow {}
