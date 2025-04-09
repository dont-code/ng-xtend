import {
  addEntity,
  entityConfig, EntityId, EntityMap,
  removeEntity,
  SelectEntityId,
  setEntities,
  setEntity,
  withEntities
} from '@ngrx/signals/entities';
import { patchState, signalStoreFeature, type, withMethods, withProps, withState } from '@ngrx/signals';
import { StoreState } from '../store-manager.service';
import { XtStoreProvider } from 'xt-store';
import { finalize, firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { Signal } from '@angular/core';
import { ManagedData } from 'xt-type';

const selectId: SelectEntityId<ManagedData> = (data) => {
  if (data._id==null) throw new Error("ManagedData with no entity Id used in the store.", { cause: data });
  return data._id;
}

const xtStoreEntityConfig = entityConfig ({
  entity: type<ManagedData>(),
  selectId:selectId
});

export type XtSignalStore<T> = {
  entityName: Signal<string>;
  loading: Signal<boolean>;
  entityMap: Signal<EntityMap<T>>;
  ids: Signal<EntityId[]>;
  entities: Signal<T[]>;

  //listEntities ():Observable<T[]>;
  fetchEntities (): Promise<void>;
  loadEntity (id:string): Promise<T|undefined>;
  safeLoadEntity (id:string): Promise<T>;
  storeEntity (toStore:T):Promise<T>;
  deleteEntity (id:string): Promise<boolean>;
}

export function withXtStoreProvider (entityName:string, storeProvider:XtStoreProvider<ManagedData>) {
  return signalStoreFeature(
    withState ({ entityName, loading:false} as StoreState),
    withEntities(xtStoreEntityConfig),
    withProps ( () => ({
      _storeProvider:storeProvider
    })),
    withMethods ((store) => ({
      async storeEntity (toStore:ManagedData): Promise<ManagedData> {
        patchState(store, {loading:true});
        return store._storeProvider.storeEntity(entityName, toStore).then ( (stored)=> {
          patchState(store, setEntity(stored, xtStoreEntityConfig));
          return stored;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },

      fetchEntities (): Promise<void> {
        patchState(store, {loading:true});
        return lastValueFrom(store._storeProvider.searchEntities(entityName).pipe (map( (entities: ManagedData[]) => {
          patchState(store, setEntities (entities, xtStoreEntityConfig));
        }),finalize(() => {
          patchState(store, {loading:false});
        })));
      },

    /*  listEntities (): Observable<ManagedData[]> {
        patchState(store, {loading:true});
        return store._storeProvider.searchEntities(entityName).pipe (map( (entities: ManagedData[]) => {
          patchState(store, setEntities (entities, xtStoreEntityConfig));
          return entities;
        }),finalize(() => {
          patchState(store, {loading:false});
        }));
      },*/

      async loadEntity (id:string): Promise<ManagedData|undefined> {
        patchState(store, {loading:true});
        return store._storeProvider.loadEntity(entityName, id).then ( (loaded)=> {
          if( loaded != null)
            patchState(store, setEntity(loaded, xtStoreEntityConfig));
          return loaded;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },
      async safeLoadEntity (id:string): Promise<ManagedData> {
        patchState(store, {loading:true});
        return store._storeProvider.loadEntity(entityName, id).then ( (loaded)=> {
          if( loaded != null)
            patchState(store, setEntity(loaded, xtStoreEntityConfig));
          return loaded;
        }).then((loaded)=> {
          if (loaded==null) throw new Error ("Entity "+entityName+" with id "+id+" not found");
          return loaded;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },
      async deleteEntity (id:string): Promise<boolean> {
        patchState(store, {loading:true});
        return store._storeProvider.deleteEntity(entityName, id).then((result)=> {
          if( result ) {
            patchState(store, removeEntity(id));
          }
          return result;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      }
    }))

);
}
