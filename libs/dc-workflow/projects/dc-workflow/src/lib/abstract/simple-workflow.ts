import { Directive, input } from '@angular/core';
import { DcWorkflow } from '../definition/dc-workflow';
import { DcWorkflowModel } from '../models/dc-workflow-model';

/**
 * Minimal base class for workflow components that do not need store access.
 *
 * It only declares the required `config` input, so creating a new workflow is
 * just three steps:
 *
 * 1. Extend `SimpleWorkflow`
 * 2. Give the component a template
 * 3. Register it with `XtResolverService.registerPlugin`
 *
 * ```typescript
 * @Component({
 *   selector: 'wfw-hello',
 *   template: `<p>Hello workflow</p>`,
 * })
 * export class HelloWorkflowComponent extends SimpleWorkflow {}
 * ```
 *
 * For workflows that read, create, update or delete entities, extend
 * `AbstractDcWorkflow` instead, which adds store management on top.
 */
@Directive()
export abstract class SimpleWorkflow implements DcWorkflow {
  /** Required workflow configuration input. */
  config = input.required<DcWorkflowModel>();
}
