import { XtResolverService } from 'xt-components';
import { WebImageComponent } from './web-image/web-image.component';
import { WebLinkComponent } from './web-link/web-link.component';
import { WebRatingComponent } from './web-rating/web-rating.component';

export function registerWebPlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin Web";
    console.info ('Registering '+pluginName);
    resolverService.registerPlugin ({
        name:pluginName,
        uriLogo:'pluginicon.png',
        components: [
            {
              componentName:'WebImage',
              componentClass:WebImageComponent,
              typesHandled: ['image'],
            },{
            componentName:'WebLink',
            componentClass:WebLinkComponent,
            typesHandled: ['link']
          },{
            componentName:'WebRating',
            componentClass:WebRatingComponent,
            typesHandled: ['rating']
          }
        ]
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerWebPlugin(resolverService);
}
