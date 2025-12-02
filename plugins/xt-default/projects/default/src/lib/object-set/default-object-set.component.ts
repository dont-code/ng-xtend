import { ChangeDetectionStrategy, Component, computed, linkedSignal, output, Signal } from '@angular/core';
import { StoreSupport, XtCompositeComponent, XtContext, XtRenderSubComponent } from 'xt-components';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'lib-default-object-set',
  imports: [XtRenderSubComponent, TableModule],
  templateUrl: './default-object-set.component.html',
  styleUrl: './default-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultObjectSetComponent<T> extends XtCompositeComponent<T[]> {
  selected= output<T>();

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
   //   console.log("Triggering select with current "+source?.length+" and previous "+previous?.source?.length);
      if ((source!=null) && (previous?.source!=null)) {
     //   console.log("Recalculating selection");
        if( previous?.value!=null) {
       //   console.log("Trying to reselect existing element");
            // Otherwise reselect the element if still there
          return source.find((toCheck) => {
            const ret= (toCheck as any)._id==(previous.value as any)._id;
         //   if (ret) console.log("Found existing element to reselect");
            return ret;
          })??null;
        }
      }
//      console.log("No selection");
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
    this.resolverService.loadAllReferencesForContext(ret, StoreSupport.getStoreManager()).then(() => {
      console.debug("Resolved all references for element "+elementIndex+ ' of type '+this.context().valueType);
    } );
    return ret;
  }

  subElementContextForName(subElementContext: XtContext<any>, subName: string, subType?: string): XtContext<any> {
    return subElementContext.subContext(subName, subType, this.resolverService?.typeResolver);
  }

  selectionChange(newElement: any) {
    this.selectedElement.set(newElement);
    this.selected.emit(newElement );
  }

  override setupInputOutput () {
    this.outputsObject.valueSelected=this.selected;
  }
}
