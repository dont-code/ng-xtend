import { XtPluginRegistry, XtResolverService } from 'xt-components';
import { DefaultPrimitiveComponent } from './primitive/default-primitive.component';

export function registerDefaultPlugin (resolverService:XtResolverService):boolean {
    console.info ('Registering Plugin Default');
    resolverService.registerPlugin ({
        name:'PluginDefault',
        components: [
            {
              componentName:'DefaultPrimitive',
              componentClass:DefaultPrimitiveComponent,
              typesHandled: [XtPluginRegistry.ANY_PRIMITIVE_TYPE]
            }
        ]
    });
    return true;
}
