import { inject, Injectable } from '@angular/core';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { XT_REGISTRY_TOKEN, XtResolvedComponent } from 'xt-components';

/**
 * Service that resolves the best workflow component for a given configuration.
 * Uses the plugin registry to find registered workflow implementations
 * that handle the requested workflow type (e.g., 'list-detail', 'carousel').
 */
@Injectable({
  providedIn: 'root',
})
export class WfwResolverService {
  /** Plugin registry containing all registered workflow components */
  pluginRegistry = inject (XT_REGISTRY_TOKEN);

  /**
   * Finds the best workflow component for the given configuration.
   * @param config - Workflow configuration specifying the workflow type
   * @returns The first matching XtResolvedComponent, or null if no match found
   */
  findBestWorkflow (config:DcWorkflowModel):XtResolvedComponent|null {
    const candidates = this.pluginRegistry.listWorkflowsForType(config.workflow);
    if (candidates.length>0) return new XtResolvedComponent( candidates[0].name, candidates[0].class);
    return null;
  }
}
