import { ChangeDetectionStrategy, Component, computed, inject, input, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { XtResolvedComponent } from 'xt-components';
import { WfwResolverService } from '../angular/wfw-resolver-service';
import { DcWorkflow } from '../definition/dc-workflow';

/**
 * Dynamic workflow renderer component.
 * Resolves and renders the appropriate workflow component (carousel or list-detail)
 * based on either an explicit type input or a configuration model.
 *
 * Usage:
 * - Provide `workflowType` to force a specific component
 * - Or provide `workflowConfig` to let the resolver pick the best workflow
 */
@Component({
  selector: 'wfw-render',
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './wfw-render.html',
  styleUrl: './wfw-render.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WfwRender<T> {
  /** Service for resolving workflow components from the plugin registry */
  resolverService = inject(WfwResolverService);

  /**
   * Explicit workflow component class to render.
   * When set, takes precedence over workflowConfig-based resolution.
   */
  workflowType = input<Type<DcWorkflow>> ();

  /**
   * Workflow configuration model used to resolve the appropriate component
   * via WfwResolverService when workflowType is not provided.
   */
  workflowConfig = input<DcWorkflowModel>();

  /**
   * Computed signal that resolves the workflow component class.
   * Priority: workflowType input > workflowConfig-based resolution > null
   */
  type:Signal<Type<DcWorkflow>|null> = computed( () => {
    let ret=this.workflowType();
    let compFound:XtResolvedComponent|null = null;
    const wfwConfig = this.workflowConfig();
    if ((ret==null)&&(wfwConfig!=null)) {
      compFound= this.resolverService.findBestWorkflow(wfwConfig);
      ret= compFound?.componentClass;
    }

    return ret??null;
  });

}
