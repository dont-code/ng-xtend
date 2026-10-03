import { XtResolverService } from 'xt-components';
import { EditorComponent } from './editor/editor.component';

export function registerEditorPlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin Editor";
    console.info ('Registering ' +pluginName);
    resolverService.registerPlugin ({
        name:pluginName,
        uriLogo:'pluginicon.png',
        components: [
            {
              componentName:'Editor',
              componentClass:EditorComponent,
              typesHandled: ['markdown','rich-text','description'],
            }
        ],
      types: {
        'markdown':'string',
        'rich-text':'string',
        'description':'string'
      }
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerEditorPlugin(resolverService);
}
