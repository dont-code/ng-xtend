import {
  entityConfig,
  EntityId,
  EntityMap,
  removeEntity,
  SelectEntityId,
  setEntities,
  setEntity,
  withEntities
} from '@ngrx/signals/entities';
import { patchState, signalStoreFeature, type, withMethods, withProps, withState } from '@ngrx/signals';
import { XtStoreProvider } from '../store-provider/xt-store-provider';
import { finalize, lastValueFrom, map, Observable, of } from 'rxjs';
import { Signal } from '@angular/core';
import { ManagedData } from 'xt-type';
import { XtStoreManager } from '../store-manager/xt-store-manager';
import { XtStoreCriteria } from '../xt-store-parameters';

export function selectId<T extends ManagedData=ManagedData>(): SelectEntityId<T> { return (data) => {
    if (data._id==null) throw new Error("ManagedData with no entity Id used in the store.", { cause: data });
    return data._id;
  }
}

export function xtStoreEntityConfig<T extends ManagedData=ManagedData> () {
  return entityConfig<T> ({
    entity: type<T>(),
    selectId:selectId<T>()
  });
};


export type StoreState = {
  entityName: string,
  loading:boolean
};

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
  searchEntities(...criteria: XtStoreCriteria[]): Observable<T[]>;
}

export function withXtStoreProvider<T extends ManagedData = ManagedData> (entityName:string, storeProvider:XtStoreProvider<T>, storeMgr?:XtStoreManager) {
  return signalStoreFeature(
    withState ({ entityName, loading:false} as StoreState),
    withEntities(xtStoreEntityConfig<T> ()),
    withProps ( () => ({
      _storeProvider:storeProvider,
      _entityConfig:xtStoreEntityConfig<T>()
    })),
    withMethods ((store) => ({
      async storeEntity (toStore:T): Promise<T> {
        patchState(store, {loading:true});
        return store._storeProvider.storeEntity(entityName, toStore).then ( (stored)=> {
          patchState(store, setEntity(stored, store._entityConfig));
          return stored;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },

      fetchEntities (): Promise<void> {
        patchState(store, {loading:true});
        return lastValueFrom(store._storeProvider.searchEntities(entityName).pipe (map( (entities: T[]) => {
          patchState(store, setEntities (entities, store._entityConfig));
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

      async loadEntity (id:string): Promise<T|undefined> {
        patchState(store, {loading:true});
        return store._storeProvider.loadEntity(entityName, id).then ( (loaded)=> {
          if( loaded != null)
            patchState(store, setEntity(loaded, store._entityConfig));
          return loaded;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },
      async safeLoadEntity (id:string): Promise<T> {
        patchState(store, {loading:true});
        return store._storeProvider.loadEntity(entityName, id).then ( (loaded)=> {
          if( loaded != null)
            patchState(store, setEntity(loaded, store._entityConfig));
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
      },
      searchEntities(...criteria: XtStoreCriteria[]): Observable<T[]> {
        patchState(store, { loading: true });
        try {
          const listEntities = store.entities();
          let toAdd=true;
          const ret = new Array<T>();
          for (const entity of listEntities) {
            toAdd=true;
            for (const crit of criteria) {
              if (!crit.filter(entity)) {
                toAdd=false;
                break;
              }
            }
            if (toAdd) ret.push(entity);
          }
          return of(ret);
        } finally {
          patchState(store, { loading: false });
        }
      }

    }))

);
}
