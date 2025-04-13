import { XtResolverService } from 'xt-components';
import { WebImageComponent } from './web-image/web-image.component';
import { WebLinkComponent } from './web-link/web-link.component';
import { WebRatingComponent } from './web-rating/web-rating.component';

export function registerWebPlugin (resolverService:XtResolverService):boolean {
    console.info ('Registering Plugin Web');
    resolverService.registerPlugin ({
        name:'PluginDefault',
        components: [
            {
              componentName:'WebImage',
              componentClass:WebImageComponent,
              typesHandled: ['Image'],
            },{
            componentName:'WebLink',
            componentClass:WebLinkComponent,
            typesHandled: ['Link']
          },{
            componentName:'WebRating',
            componentClass:WebRatingComponent,
            typesHandled: ['Rating']
          }
        ]
    });
    return true;
}
