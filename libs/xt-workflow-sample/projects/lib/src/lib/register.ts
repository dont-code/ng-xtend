import { XtResolverService } from 'xt-components';
import { SampleWorkflowComponent } from './sample-workflow.component';

/**
 * The workflow type handled by the sample workflow.
 * Use it as the `workflow` value of a `DcWorkflowModel`.
 */
export const SAMPLE_WORKFLOW_TYPE = 'sample';

/**
 * Registers the sample workflow plugin with the resolver service.
 *
 * @param resolverService - The resolver service to register with
 * @returns true if registration succeeded
 */
export function registerWorkflowSamplePlugin(resolverService: XtResolverService): boolean {
  const pluginName = 'Plugin Workflow Sample';
  console.info('Registering ' + pluginName);
  resolverService.registerPlugin({
    name: 'wfwSamplePlugin',
    workflows: [
      {
        name: 'wfwSample',
        class: SampleWorkflowComponent,
        workflowsHandled: [SAMPLE_WORKFLOW_TYPE],
      },
    ],
  });
  return true;
}

/** Alias kept for consistency with the other plugin registration functions. */
export function registerPlugin(resolverService: XtResolverService): boolean {
  return registerWorkflowSamplePlugin(resolverService);
}
