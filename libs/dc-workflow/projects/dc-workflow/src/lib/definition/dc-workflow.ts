import { XtWorkflow } from 'xt-components';
import { InputSignal } from '@angular/core';
import { DcWorkflowModel } from '../models/dc-workflow-model';

/**
 * An implementation of XtWorkflow type with support for store
 */
export type DcWorkflow = XtWorkflow & {
  config: InputSignal<DcWorkflowModel>;

}
