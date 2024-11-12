import { XtResolverService } from '../angular/xt-resolver.service';
import { inject } from '@angular/core';

export class XtUnitTestHelper {
  public static resolverService = inject (XtResolverService);
  public static registerComponent<T> (name:string, compClass:T, type:string){
    this.resolverService.pluginRegistry.registerComponent({
      componentName:name,
      componentClass: compClass,
      typesHandled: [type]
    });
  }

}
