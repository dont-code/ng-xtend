import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal, Signal } from '@angular/core';
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

  selectedElement = linkedSignal<T[]|null, T|null> ({
    source: this.valueSet,
    computation: (source, previous) => {
      if ((source!=null) && (previous?.value!=null)) {
        // Detect if a new element has just been added, then selects it.
        if ((previous.source!=null) && (previous.source.length==source.length+1)) {
          for (const newElem of source.reverse()) {
            const findIt=previous.source.find((toCheck) => {
              return (toCheck as any)._id==(newElem as any)._id;
            });
            if (findIt==null) {
              return newElem;
            }
          }
        } else {
            // Otherwise reselect the element if still there
          return source.find((toCheck) => {
            return (toCheck as any)._id==(previous.value as any)._id;
          })??null;
        }
      }
      return null;
    }
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
