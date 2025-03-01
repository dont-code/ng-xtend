import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, Signal } from '@angular/core';
import { XtCompositeComponent, XtContext, XtRenderSubComponent, XtResolverService } from 'xt-components';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'lib-default-object-set',
  imports: [XtRenderSubComponent, TableModule],
  templateUrl: './default-object-set.component.html',
  styleUrl: './default-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultObjectSetComponent<T> extends XtCompositeComponent<T[]> {
  resolver = inject(XtResolverService);
  override hasOutputs = true;

  selectedElement = linkedSignal<T|null> (
    () => {
      const list= this.valueSet();
      if (list.length>0) {
        return list[0];
      } else return null;
    }
  );

  debugValue=false;
  debugSelectedElement:Signal<boolean> = computed<boolean>(() => {
    console.debug("Selected element", this.selectedElement());
    this.debugValue=!this.debugValue;
    return this.debugValue;
  });

  valueSet = computed(() => {
    const ret = this.context().value();
    if (Array.isArray(ret)) {
      return ret as T[];
    } else if (ret!=null) {
      return [ret] as T[];
    } else return [];
  });

  subNames = computed(() => {
    const ret = this.resolver.listSubNamesOf(this.context(), this.valueSet());
    return ret;
  });


  elementSetContext(elementIndex: number): XtContext<any> {
    this.formGroupIfAny();

    return this.context().elementSetContext(elementIndex);
  }

  subElementContextForName(subElementContext: XtContext<any>, subName: string, subType?: string): XtContext<any> {
    return subElementContext.subContext(subName, subType, this.resolverService?.typeResolver);
  }

  selectionChange(newElement: any) {
    this.selectedElement.set(newElement);
    this.emitOutput ('valueSelected', newElement );
  }
}
