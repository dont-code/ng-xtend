import { XtResolverService } from '../angular/xt-resolver.service';
import { inject } from '@angular/core';
import { delay, find, lastValueFrom, range } from 'rxjs';

/**
 * Helper class to ease unit testing
 */
export class XtUnitTestHelper {
/*  public static registerComponent<T> (name:string, compClass:T, type:string){
    this.resolverService.pluginRegistry.registerComponent({
      componentName:name,
      componentClass: compClass,
      typesHandled: [type]
    });
  }
*/
  /**
   * Asynchronously wait for test function to return true. By default try 20 times with a delay of 50ms
   * @param test
   * @param tries
   * @param timer
   */
  public static async waitFor(test: () => boolean, tries:number=20, timer:number=50): Promise<void> {
    await lastValueFrom(range(0, tries).pipe(
      delay(timer),
      find( test)
    ));
  }

}
