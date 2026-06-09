import { ChangeDetectionStrategy, Component, computed, inject, input, Signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { XtResolvedComponent } from 'xt-components';
import { WfwResolverService } from '../angular/wfw-resolver-service';
import { DcWorkflow } from '../definition/dc-workflow';

/**
 * Renders a Workflow based on the given class or by the configuration
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
  resolverService = inject(WfwResolverService);

  /**
   * Use this input to enforce the workflow class to use
   */
  workflowType = input<Type<DcWorkflow>> ();

  /**
   * Use this to configure the behavior of the workflow
   */
  workflowConfig = input<DcWorkflowModel>();

  /**
   * Calculates the workflow component to use, either from the workflowType or workflowConfig input
   */
  type:Signal<Type<DcWorkflow>|null> = computed( () => {
    let type=this.workflowType();
    let compFound:XtResolvedComponent|null = null;
    const wfwConfig = this.workflowConfig();
    if ((type==null)&&(wfwConfig!=null)) {
      compFound= this.resolverService.findBestWorkflow(wfwConfig);
      type= compFound?.componentClass;
    }

    return type??null;
  });

}
