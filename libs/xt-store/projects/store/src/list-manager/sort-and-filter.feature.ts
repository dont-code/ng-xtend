import { signalStoreFeature, withState } from '@ngrx/signals';

export type SortAndFilterState = {sort:'NONE'|'ASC'|'DESC', filter:string|null}

export function withSortAndFilter () {
    return signalStoreFeature(
      withState<SortAndFilterState>({sort:'NONE', filter:null }),
      );
}
