import { XtWorkflow } from 'xt-components';
import { InputSignal } from '@angular/core';
import { DcWorkflowModel } from '../models/dc-workflow-model';

/**
 * Extended workflow type that adds store-backed configuration.
 * Combines the base XtWorkflow interface with a required config signal
 * that provides entity, workflow type, sorting, display, and selection settings.
 */
export type DcWorkflow = XtWorkflow & {
  /** Required configuration input signal controlling workflow behavior */
  config: InputSignal<DcWorkflowModel>;

}
