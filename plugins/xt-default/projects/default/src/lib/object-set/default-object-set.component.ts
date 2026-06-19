import { ChangeDetectionStrategy, Component, computed, linkedSignal, model, output, Signal } from '@angular/core';
import { StoreSupport, XtCompositeComponent, XtContext, XtRenderSubComponent, XtBaseModel } from 'xt-components';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'lib-default-object-set',
  imports: [XtRenderSubComponent, TableModule],
  templateUrl: './default-object-set.component.html',
  styleUrl: './default-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultObjectSetComponent<T> extends XtCompositeComponent<T[]> {
  selected= model<any>();

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

  private selectionContext = computed(() => ({
    values: this.valueSet(),
    current: this.selected()
  }));

  selectedElement = linkedSignal<{values: T[]|null, current: T|null}, T|null> ({
    source: this.selectionContext,
    computation: (source, previous) => {
      if (source.values == null || source.values.length === 0) return null;

      // First try to find the currently selected model value in the source
      if (source.current != null) {
        const found = source.values.find((toCheck) => {
          if ((toCheck as any)._id != null && (source.current as any)._id != null) {
            return (toCheck as any)._id === (source.current as any)._id;
          }
          return toCheck === source.current;
        });
        if (found) return found;
      }

      // Fallback: maintain previous selection across list refresh
      if (previous?.value != null) {
        return source.values.find((toCheck) => {
          if ((toCheck as any)._id != null) {
            return (toCheck as any)._id === (previous.value as any)._id;
          }
          return toCheck === previous.value;
        }) ?? null;
      }

      return null;
    }
  });

  subNames = computed(() => {
    const ret = this.resolverService.listSubNamesOf(this.context(), this.valueSet());
    return ret;
  });

  elementSetContext(elementIndex: number): XtContext<any> {
    this.formGroupIfAny();

    const ret= this.context().elementSetContext(elementIndex);
  /*  this.resolverService.loadAllReferencesForContext(ret, StoreSupport.getStoreManager()).then(() => {
      console.debug("Resolved all references for element "+elementIndex+ ' of type '+this.context().valueType);
    } );*/
    return ret;
  }

  subElementContextForName(subElementContext: XtContext<any>, subName: string, subType?: string): XtContext<any> {
    return subElementContext.subContext(subName, subType, this.resolverService?.typeResolver);
  }

  selectionChange(newElement: any) {
    this.selectedElement.set(newElement);
    this.selected.set(newElement );
  }

  override setupInputOutput () {
    const parentModel=this.models();
    if (parentModel?.valueSelected != null) {
      this.selected=parentModel.valueSelected;
    }
  }
}
