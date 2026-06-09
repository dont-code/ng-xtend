import { XtResolverService } from 'xt-components';
import { ListDetailsComponent } from './list-details/list-details.component';

export function registerWorkflowPlugin (resolverService:XtResolverService):boolean {
  const pluginName = "Plugin Workflow";
  console.info ('Registering ' +pluginName);
  resolverService.registerPlugin({
    name:'wfwListDetailsPlugin',
    workflows: [{
        name:'wfwListDetails',
        class:ListDetailsComponent,
        workflowsHandled:['list-details']
      }
    ]
  })
    return true;
}
