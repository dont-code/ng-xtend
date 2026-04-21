import { XtResolverService } from 'xt-components';

export function registerWorkflowPlugin (resolverService:XtResolverService):boolean {
  const pluginName = "Plugin Workflow";
  console.info ('Registering ' +pluginName);
    return true;
}
