import {
  entityConfig,
  EntityId,
  EntityMap,
  removeEntity,
  SelectEntityId, setAllEntities,
  setEntities,
  setEntity,
  withEntities
} from '@ngrx/signals/entities';
import { patchState, signalStore, signalStoreFeature, type, withMethods, withProps, withState } from '@ngrx/signals';
import { XtStoreProvider } from '../store-provider/xt-store-provider';
import { finalize, firstValueFrom, lastValueFrom, map, mergeMap, Observable, of } from 'rxjs';
import { Signal } from '@angular/core';
import { ManagedData, XtTypeResolver } from 'xt-type';
import { XtStoreManager } from '../store-manager/xt-store-manager';
import { XtSortBy, XtStoreCriteria } from '../xt-store-parameters';
import { XtStoreProviderHelper } from '../store-provider/xt-store-provider-helper';
import { XtStoreSortBy } from '../xt-reporting';

/**
 * Returns a selector function that extracts the `_id` field from ManagedData.
 * @returns An entity ID selector for @ngrx/signals entities
 */
export function selectId<T extends ManagedData=ManagedData>(): SelectEntityId<T> { return (data) => {
    if (data._id==null) throw new Error("ManagedData with no entity Id used in the store.", { cause: data });
    return data._id;
  }
}

/**
 * Creates an entity configuration for @ngrx/signals entities using the default ID selector.
 * @returns An entity config for the given type
 */
export function xtStoreEntityConfig<T extends ManagedData=ManagedData> () {
  return entityConfig<T> ({
    entity: type<T>(),
    selectId:selectId<T>()
  });
};


/**
 * Reactive state shape held by the SignalStore for a single entity type.
 */
export type StoreState<T extends ManagedData=ManagedData> = {
  entityName: string,
  loading:boolean,
  sort?: XtSortBy<T>[],
  filter?: XtStoreCriteria<T>[]
};

/**
 * A SignalStore that provides additional methods to manipulate ManagedDatas.
 */
export type XtSignalStore<T extends ManagedData=ManagedData> = {
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
  searchEntities(...criteria: XtStoreCriteria<T>[]): Observable<T[]>;

  updateStoreOptions (option:XtStoreEntityFeatureOptions<T>|undefined):Promise<void>;
}

/**
 * Enables SignalStore to manipulate ManagedData entities through one provider or more.
 * If given the typeRegistry, it uses the information in it to manage references
 * @param entityName
 * @param storeProvider
 * @param storeMgr
 * @param typeRegistry
 * @param options
 */
export function withXtStoreProvider<T extends ManagedData = ManagedData> (entityName:string, storeProvider?:XtStoreProvider<T>, storeMgr?:XtStoreManager, typeRegistry?: XtTypeResolver, options?: XtStoreEntityFeatureOptions<T>) {
  return signalStoreFeature(
    withState ({ entityName, loading:false, sort:options?.sort, filter:options?.filter} as StoreState<T>),
    withEntities(xtStoreEntityConfig<T> ()),
    withProps ( () => ({
      _storeProvider:storeProvider??storeMgr!.getProviderSafe<T>(entityName),
      _storeMgr:storeMgr,
      _typeResolver:typeRegistry,
      _entityConfig:xtStoreEntityConfig<T>()
    })),
    withMethods ((store) => ({
      /**
       * Stores (creates or updates) an entity through the provider, handling reference
       * clearing and re-application.
       * @param toStore - The entity to store
       * @returns A promise resolving to the stored entity
       */
      async storeEntity (toStore:T): Promise<T> {
        patchState(store, {loading:true});
          return this._clearReferences(toStore).then((valAndRef) => {
            return store._storeProvider.storeEntity(entityName, valAndRef.newValue).then((stored) => {
              return { newValue: stored, references: valAndRef.references };
            });
          }).then((valAndRef) => {
            return this._applyReferences(valAndRef.newValue, valAndRef.references);
          }).then((stored) => {
            this._patchStateSetEntity (stored);
          return stored;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },

      /**
       * Fetches all entities from the provider and replaces the store's entity collection.
       * @returns A promise that resolves when entities are loaded
       */
      fetchEntities (): Promise<void> {
        patchState(store, {loading:true});
        return lastValueFrom(this._callProviderSearchEntities().pipe ( mergeMap((entities:T[]) => {
          return this._resolveReferences(entities);
        }),map( (entities: T[]) => {
          patchState(store, setAllEntities (entities, store._entityConfig));
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

      /**
       * Loads a single entity by ID into the store.
       * @param id - The entity identifier
       * @returns A promise resolving to the entity or undefined
       */
      async loadEntity (id:string): Promise<T|undefined> {
        patchState(store, {loading:true});
        return store._storeProvider.loadEntity(entityName, id).then((loaded) => {
          if (loaded != null)
            return this._resolveReferences([loaded]).then((results) => results[0]);
          return loaded;
        }).then ( (loaded)=> {
          if( loaded != null)
            patchState(store, setEntity(loaded, store._entityConfig));
          return loaded;
        }).finally(() => {
          patchState(store, {loading:false});
        });
      },
      /**
       * Loads a single entity by ID, throwing if not found.
       * @param id - The entity identifier
       * @returns A promise resolving to the entity
       */
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
      /**
       * Deletes an entity by ID and removes it from the store.
       * @param id - The entity identifier
       * @returns A promise resolving to true if deletion succeeded
       */
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
      /**
       * Filters the currently loaded entities by the given criteria.
       * @param criteria - Filter criteria to apply
       * @returns An observable emitting the matching entities
       */
      searchEntities(...criteria: XtStoreCriteria<T>[]): Observable<T[]> {
        patchState(store, { loading: true });
        try {
          const listEntities = store.entities();
          const ret = new Array<T>();
          for (const entity of listEntities) {
            if (this._isPassingFilter(entity, false, criteria)){
                ret.push(entity);
            }
          }
          return of(ret);
        } finally {
          patchState(store, { loading: false });
        }
      },

      /**
       * Updates the store options (sort, filter) and re-fetches entities.
       * @param option - The new store feature options
       */
      async updateStoreOptions (option:XtStoreEntityFeatureOptions<T> | undefined):Promise<void> {
        patchState(store, {sort:option?.sort, filter:option?.filter});
        await this.fetchEntities();
      },

      /**
       * Detects and replace all referenced objects by the key value that will be stored.
       * @param toClear
       */
      async _clearReferences(toClear: T): Promise<{ newValue: T, references: any }> {
        if( typeRegistry==null) return  { newValue:toClear, references:{}};

        const refs = typeRegistry.listReferences(entityName);
        const savedRefs = {} as T;
        for (const refKey of Object.keys(refs)) {
          const refDef = refs[refKey];
          if (toClear[refKey] != null) {
            (savedRefs as any)[refKey] = toClear[refKey];
            (toClear as any)[refKey] = (toClear[refKey] as any)[refDef.field];
          }
        }
        return { newValue: toClear, references: savedRefs };
      },

      /**
       * From the key values, assign the relevant referenced object so that it's transparent to the caller
       * @param values
       */
      async _resolveReferences(values: T[]): Promise<T[]> {
        if ((typeRegistry==null)||(storeMgr==null)) return values;

        const refs = typeRegistry.listReferences(entityName);
        for (const refKey of Object.keys(refs)) {
          const refDef = refs[refKey];
          const refStoreType = signalStore(withXtStoreProvider(refDef.toType, undefined, storeMgr, typeRegistry));
          const refStore = new refStoreType();
          await refStore.fetchEntities();
          for (const value of values) {
            if (value[refKey] != null) {
              const founds = await firstValueFrom(refStore.searchEntities( new XtStoreCriteria(refDef.field, value[refKey], '=')));
              if (founds.length != 1) {
                throw new Error("More than one entity found for reference " + refKey + " with value " + value[refKey] + " in entity " + entityName + ".");
              }
              (value as any)[refKey] = founds[0];
            }
          }
        }
      return values;
      },

      /**
       * Re-apply the already found references
       * @param newValue
       * @param references
       */
      async _applyReferences(newValue: T, references: ManagedData): Promise<T> {
        if (references != null) {
          // Override the values with the references
          return { ...newValue, ...references } as T;
        } else return newValue;
      },

      _patchStateSetEntity (stored:T) {
        // Ensure the entity is still part of the list
        if (this._isPassingFilter (stored, true)) {
          // It's still in the list, now check if sort needs to be applied
          if (this._safeSort().length>0) {
              // We remove it from the old sort
            if (stored._id!=null)
              patchState(store, removeEntity (stored._id));

              // And find it's right position
            const newList = XtStoreProviderHelper.insertInSortedList(stored, store.entities(), this._safeSort());
            patchState (store, setAllEntities (newList, store._entityConfig));
          } else {
            patchState(store, setEntity(stored, store._entityConfig));
          }
        } else {
          // Maybe it was in the list and it is no more due to the modification. Let's make sure by removing it
          if (stored._id!=null)
            patchState(store, removeEntity (stored._id));
        }

      },
      _isPassingFilter (element:T, applyFilters:boolean=false, criteria?:XtStoreCriteria<T>[]):boolean {
        if (criteria===undefined) {
          criteria=this._safeFilter();
        }
        for (const crit of criteria) {
          if (!crit.filter(element)) {
            // One filter is not met, but we may be allowed to set it automatically
            if ((applyFilters)&& (crit.operator=='=') && (element[crit.name]==null)) {
              // We enforce the criteria
              element[crit.name]=crit.value;
            }else {
              return false;
            }
          }
        }
        return true;
      },
      _safeFilter (): XtStoreCriteria<T>[] {
        const ret=store.filter?store.filter():null;
        if ((ret!=null) && (ret.length>0)) {
          return ret;
        }
        return [];
      },
      _safeSort (): XtSortBy<T>[] {
        const ret=store.sort?store.sort():null;
        if ((ret!=null) && (ret.length>0)) {
          return ret;
        }
        return [];
      },
      _callProviderSearchEntities ():Observable<T[]> {
        const sort=this._safeSort();
        if( sort.length>0) {
          // We call the full function but only needs the sorted & filtered data (no need for grouping)
          return store._storeProvider.searchAndPrepareEntities(entityName, this._safeSort(),undefined,undefined,...this._safeFilter()).pipe(
            map((value) => {
              return value.sortedData;
            })
          )
        } else {
          // If we don't need sorting, then a simpler function can be called
          return store._storeProvider.searchEntities(entityName, ...this._safeFilter());
        }
      }
    })
  )
);
}

/**
 * Optional configuration for an entity SignalStore, including default sort and filter settings.
 */
export type XtStoreEntityFeatureOptions<T extends ManagedData=ManagedData>= {
  sort?:XtSortBy<T>[];
  filter?:XtStoreCriteria<T>[];
}
