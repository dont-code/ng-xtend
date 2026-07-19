import { XtResolverService } from 'xt-components';
import { ListDetailsComponent } from './list-details/list-details.component';
import { CarouselComponent } from './carousel/carousel.component';

/**
 * Registers the workflow plugin with the resolver service.
 * Maps workflow types ('list-detail', 'carousel') to their component implementations.
 *
 * @param resolverService - The resolver service to register with
 * @returns true if registration succeeded
 */
export function registerWorkflowPlugin (resolverService:XtResolverService):boolean {
  const pluginName = "Plugin Workflow";
  console.info ('Registering ' +pluginName);
  resolverService.registerPlugin({
    name:'wfwListDetailsPlugin',
    workflows: [{
        name:'wfwListDetails',
        class:ListDetailsComponent,
        workflowsHandled:['list-detail']
      },{
      name:'wfwCarousel',
      class:CarouselComponent,
      workflowsHandled:['carousel']
    }
    ]
  })
    return true;
}
