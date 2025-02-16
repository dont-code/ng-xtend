import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { XtCompositeComponent, XtContext, XtRenderSubComponent, XtResolverService } from 'xt-components';

@Component({
  selector: 'lib-default-object-set',
  imports: [XtRenderSubComponent],
  templateUrl: './default-object-set.component.html',
  styleUrl: './default-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultObjectSetComponent<T> extends XtCompositeComponent<T[]>{
  resolver = inject(XtResolverService);

  valueSet = computed(() => {
    const ret = this.context().value();
    if (Array.isArray(ret)) {
      return ret as T[];
    } else {
      return [ret] as T[];
    }
  });

  subNames = computed (()=> {
    const ret= this.resolver.listSubNamesOf(this.context(), this.valueSet());
    return ret;
  });

  elementSetContext (elementIndex:number): XtContext<any> {
    this.formGroupIfAny();

    return this.context().elementSetContext(elementIndex);
  }

  subElementContextForName (subElementContext:XtContext<any>, subName:string, subType?:string): XtContext<any> {
    return subElementContext.subContext(subName, subType, this.resolverService?.typeResolver);
  }

}
