import { XtPluginRegistry, XtResolverService } from 'xt-components';
import { DefaultPrimitiveComponent } from './primitive/default-primitive.component';
import { DefaultObjectComponent } from './object/default-object.component';

export function registerDefaultPlugin (resolverService:XtResolverService):boolean {
    console.info ('Registering Plugin Default');
    resolverService.registerPlugin ({
        name:'PluginDefault',
        components: [
            {
              componentName:'DefaultPrimitive',
              componentClass:DefaultPrimitiveComponent,
              typesHandled: [XtPluginRegistry.ANY_PRIMITIVE_TYPE, 'string', 'number', 'boolean', 'date'],
            },{
            componentName:'DefaultObject',
            componentClass:DefaultObjectComponent,
            typesHandled: [XtPluginRegistry.ANY_OBJECT_TYPE]
          }
        ]
    });
    return true;
}
