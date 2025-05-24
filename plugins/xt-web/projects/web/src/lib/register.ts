import { XtResolverService } from 'xt-components';
import { WebImageComponent } from './web-image/web-image.component';
import { WebLinkComponent } from './web-link/web-link.component';
import { WebRatingComponent } from './web-rating/web-rating.component';

export function registerWebPlugin (resolverService:XtResolverService):boolean {
    console.info ('Registering Plugin Web');
    resolverService.registerPlugin ({
        name:'PluginWeb',
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
    return true;
}
