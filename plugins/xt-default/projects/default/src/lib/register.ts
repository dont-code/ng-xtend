import { XtPluginRegistry, XtResolverService } from 'xt-components';
import { DefaultPrimitiveComponent } from './primitive/default-primitive.component';
import { DefaultObjectComponent } from './object/default-object.component';
import { DefaultObjectSetComponent } from './object-set/default-object-set.component';

export function registerDefaultPlugin (resolverService:XtResolverService):boolean {
  const pluginName = "Plugin Default";
  console.info ('Registering ' +pluginName);
    resolverService.registerPlugin ({
        name:'PluginDefault',
        components: [
            {
              componentName:'DefaultPrimitive',
              componentClass:DefaultPrimitiveComponent,
              typesHandled: [XtPluginRegistry.ANY_PRIMITIVE_TYPE, 'string', 'number', 'boolean', 'date', 'time', 'date-time'],
            },{
            componentName:'DefaultObject',
            componentClass:DefaultObjectComponent,
            typesHandled: [XtPluginRegistry.ANY_OBJECT_TYPE]
          },{
            componentName:'DefaultObjectSet',
            componentClass:DefaultObjectSetComponent,
            typesHandled: [XtPluginRegistry.ANY_OBJECT_SET],
            outputs: ['valueSelected']
          }
        ]
    });
    return true;
}
