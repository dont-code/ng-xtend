import { ChangeDetectionStrategy, Component, computed, model, output, Signal } from '@angular/core';
import { XtContext, XtRenderSubComponent } from 'xt-components';
import { TableModule } from 'primeng/table';
import { isTypeReference, XtTypeHierarchy, XtTypeReference } from 'xt-type';
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

  /** Sub-fields that can be sorted. Only primitives (string, number, date, boolean) are sortable for now. */
  sortableSubNames = computed<Set<string>>(() => {
    const sortable = new Set<string>();
    for (const subName of this.subNames()) {
      if (this.isSubFieldTypeSortable(subName)) {
        sortable.add(subName);
      }
    }
    return sortable;
  });

  /**
   * Resolves the type name of a sub-field, either from the registered type definition or by
   * inferring it from the first value when no type information is available.
   * @param subName - The sub-field name to resolve
   * @returns The type name, or null when it cannot be determined or is a reference
   */
  private subFieldTypeName(subName: string): string | null | undefined {
    const typeResolver = this.resolverService.typeResolver;
    const values = this.valueSet();
    const firstElement = (Array.isArray(values) && values.length > 0) ? values[0] : null;

    let subType: XtTypeReference | XtTypeHierarchy | null | undefined = null;
    try {
      subType = typeResolver.findType(this.context().valueType, subName, firstElement);
    } catch {
      subType = null;
    }
    if (subType != null) {
      if (isTypeReference(subType)) {
        return null;
      }
      return (subType as XtTypeHierarchy).type;
    }

    if (firstElement == null) {
      return null;
    }
    return typeResolver.findPrimitiveType((firstElement as any)[subName])?.type;
  }

  /** Checks whether the sub-field type is a sortable primitive (string, number, date or boolean). */
  private isSubFieldTypeSortable(subName: string): boolean {
    const typeName = this.subFieldTypeName(subName);
    return (typeName == 'string') || (typeName == 'number') || (typeName == 'date') || (typeName == 'boolean');
  }

  /** Builds an XtContext for a specific row element so its sub-fields can be rendered inline. */
  elementSetContext(elementIndex: number): XtContext<any> {
    this.formGroupIfAny();

    const ret= this.context().elementSetContext(elementIndex);
    return ret;
  }

  /**
   * Builds an XtContext for the given rendered row element.
   *
   * The element is resolved by identity inside the current value set rather than by the
   * row's display index, because sorting may reorder the rows PrimeNG renders (it sorts a
   * copy of the value array) while the underlying context value keeps its own order.
   * @param element - The row element currently rendered by the table.
   * @param fallbackIndex - Display index used if the element is not found in the value set.
   */
  elementSetContextFor(element: T, fallbackIndex: number): XtContext<any> {
    const index = this.valueSet().indexOf(element);
    return this.elementSetContext(index >= 0 ? index : fallbackIndex);
  }

  /** Resolves a sub-context within a row for the given field name. */
  subElementContextForName(subElementContext: XtContext<any>, subName: string, subType?: string): XtContext<any> {
    return subElementContext.subContext(subName, subType, this.resolverService?.typeResolver);
  }
}
