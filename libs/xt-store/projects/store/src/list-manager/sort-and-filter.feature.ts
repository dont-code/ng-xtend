import { signalStoreFeature, withState } from '@ngrx/signals';

/**
 * Reactive state shape for sort and filter controls.
 */
export type SortAndFilterState = {sort:'NONE'|'ASC'|'DESC', filter:string|null}

/**
 * SignalStore feature that adds sort and filter state to a store.
 * @returns A signal store feature with sort/filter state
 */
export function withSortAndFilter () {
    return signalStoreFeature(
      withState<SortAndFilterState>({sort:'NONE', filter:null }),
      );
}
