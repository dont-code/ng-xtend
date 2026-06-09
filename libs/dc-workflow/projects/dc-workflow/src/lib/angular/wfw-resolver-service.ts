import { inject, Injectable } from '@angular/core';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { XT_REGISTRY_TOKEN, XtResolvedComponent } from 'xt-components';

@Injectable({
  providedIn: 'root',
})
export class WfwResolverService {
  pluginRegistry = inject (XT_REGISTRY_TOKEN);

  findBestWorkflow (config:DcWorkflowModel):XtResolvedComponent|null {
    const candidates = this.pluginRegistry.listWorkflowsForType(config.workflow);
    if (candidates.length>0) return new XtResolvedComponent( candidates[0].name, candidates[0].class);
    return null;
  }
}
