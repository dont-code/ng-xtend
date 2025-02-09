import { Injectable } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  removeEntities,
  removeEntity,
  SelectEntityId,
  setEntity,
  withEntities
} from '@ngrx/signals/entities';



type ManagedData = {
  _id:string,
  [keys:string]: ManagedData | string | number | boolean | undefined | null
}

const selectId: SelectEntityId<ManagedData> = (data) => data._id;

@Injectable({
  providedIn: 'root'
})
export class StoreManagerService {

  protected entityToStoreMap = new Map<string, any>();

  protected static EMPTY_STORE=signalStore(withState({
    entityName: null,
    entities:[],
    loading:false
  }));

  constructor() {

  }

getStoreFor (entityName:string|null):any {
    if (entityName==null) {
      return StoreManagerService.EMPTY_STORE;
    } else {
      let store = this.entityToStoreMap.get(entityName);
      if (store==null) {
        store = signalStore(
          withState ({ entityName, loading:false } as StoreState),
          withEntities<ManagedData> (),
          withMethods((store) => ({
              add(toAdd: ManagedData): void {
                patchState(store, setEntity(toAdd, {selectId}));
              },
              remove(id:string): void {
                patchState(store, removeEntity(id), {selectId});
              }
            }
          )),
          withDataStoreProvider (n)
        )
        this.entityToStoreMap.set(entityName, store);
      }
      return store;
    }
  }
}

type StoreState = {
  entityName: string,
  loading:boolean,
  dataProvider: DataStoreProvider
};


