import { computed, linkedSignal } from '@angular/core';
import { XtCompositeComponent } from 'xt-components';

/**
 * Base class for object-set components that display a collection of items and support single selection.
 *
 * Provides shared logic for:
 * - Deriving a typed value array from context
 * - Maintaining a stable selected element across list refreshes (by _id or reference equality)
 * - Emitting selection changes via output or model binding
 * - Wiring up input/output bindings from parent models
 *
 * Subclasses must provide `selected` (model) and `valueSelectedAsOutput` (output) via `model()`/`output()`.
 */
export abstract class ObjectSetBase<T> extends XtCompositeComponent<T[]> {
  /** Two-way model for the currently selected item. Initialized by the subclass with `model()`. */
  declare selected: any;

  /** Fallback output emitter used when no parent model is provided. Initialized by the subclass with `output()`. */
  protected declare valueSelectedAsOutput: any;

  /** The array of items to display, derived from the context value. Handles null/undefined and single-element cases. */
  valueSet = computed(() => {
    const ret = this.context().value();
    if (Array.isArray(ret)) {
      return ret as T[];
    } else if (ret != null) {
      return [ret] as T[];
    } else return [];
  });

  /** Tracks the current selection context (value set + selected item) to drive the linkedSignal below. */
  private selectionContext = computed(() => ({
    values: this.valueSet(),
    current: this.selected()
  }));

  /**
   * Stable selected element that survives list refreshes.
   * - Matches by `_id` when both items have one, otherwise falls back to reference equality.
   * - Retains the previous selection when the list changes (e.g. after a save or filter).
   * - Clears selection when the previously selected item is no longer in the list.
   */
  selectedElement = linkedSignal<{values: T[]|null, current: T|null}, T|null>({
    source: this.selectionContext,
    computation: (source, previous) => {
      if (source.values == null || source.values.length === 0) return null;

      if (source.current != null) {
        const found = source.values.find((toCheck) => {
          if ((toCheck as any)._id != null && (source.current as any)._id != null) {
            return (toCheck as any)._id === (source.current as any)._id;
          }
          return toCheck === source.current;
        });
        if (found) return found;
      }

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

  /** Updates the selected element and emits the new value through the output if configured. */
  selectionChange(newElement: any) {
    this.selectedElement.set(newElement);
    this.selected.set(newElement);
    if (this.outputsObject.valueSelected != null) {
      this.outputsObject.valueSelected.emit(newElement);
    }
  }

  /**
   * Hooks into the parent model chain. If a parent provides a `valueSelected` model, use it directly
   * (two-way binding). Otherwise expose our own output emitter for the host to listen to.
   */
  override setupInputOutput() {
    const parentModel = this.models();
    if (parentModel?.valueSelected != null) {
      this.selected = parentModel.valueSelected;
    } else {
      this.outputsObject.valueSelected = this.valueSelectedAsOutput;
    }
  }
}
