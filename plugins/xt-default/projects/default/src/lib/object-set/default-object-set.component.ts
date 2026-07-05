import { ChangeDetectionStrategy, Component, computed, model, output, Signal } from '@angular/core';
import { XtContext, XtRenderSubComponent } from 'xt-components';
import { TableModule } from 'primeng/table';
import { ObjectSetBase } from './object-set-base';

/**
 * Table-based (default) object-set component.
 *
 * Renders a collection of items as a PrimeNG Table with:
 * - One column per sub-field of the element type.
 * - Single-selection via pSelectableRow.
 * - Dynamic sub-context resolution for inline editing of nested fields.
 */
@Component({
  selector: 'lib-default-object-set',
  imports: [XtRenderSubComponent, TableModule],
  templateUrl: './default-object-set.component.html',
  styleUrl: './default-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultObjectSetComponent<T> extends ObjectSetBase<T> {
  override selected = model<any>();
  protected override valueSelectedAsOutput = output<any>();

  /** Debug toggle that flips on each render to force change detection. */
  debugValue=false;

  /** Debug signal (read in templates to trigger expression re-evaluation). */
  debugSelectedElement:Signal<boolean> = computed<boolean>(() => {
    this.debugValue=!this.debugValue;
    return this.debugValue;
  });

  /** Names of the sub-fields that form the table columns. */
  subNames = computed(() => {
    const ret = this.resolverService.listSubNamesOf(this.context(), this.valueSet());
    return ret;
  });

  /** Builds an XtContext for a specific row element so its sub-fields can be rendered inline. */
  elementSetContext(elementIndex: number): XtContext<any> {
    this.formGroupIfAny();

    const ret= this.context().elementSetContext(elementIndex);
    return ret;
  }

  /** Resolves a sub-context within a row for the given field name. */
  subElementContextForName(subElementContext: XtContext<any>, subName: string, subType?: string): XtContext<any> {
    return subElementContext.subContext(subName, subType, this.resolverService?.typeResolver);
  }
}
