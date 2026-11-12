import { Component, input } from '@angular/core';
import { XtCompositeComponent } from 'xt-components';
import { DcWorkflow } from '../definition/dc-workflow';
import { DcWorkflowModel } from '../models/dc-workflow-model';

/**
 * Minimal base class for workflow components that do not need store access.
 *
 * It declares the required `config` input (and inherits the component machinery
 * from `XtCompositeComponent`), so creating a store-less workflow is just a
 * template plus a registration:
 *
 * ```typescript
 * @Component({
 *   selector: 'wfw-hello',
 *   template: `<p>Hello workflow</p>`,
 * })
 * export class HelloWorkflowComponent extends AbstractDcWorkflowBase {}
 * ```
 *
 * For workflows that read, create, update or delete entities, extend
 * `AbstractDcWorkflow` instead, which adds store management on top.
 *
 * @typeParam T - The managed data type handled by the workflow
 */
@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class AbstractDcWorkflowBase<T = any> extends XtCompositeComponent<T> implements DcWorkflow {
  /** Required workflow configuration input. */
  config = input.required<DcWorkflowModel>();
}
