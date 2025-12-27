import { removeEntity, setEntities, setEntity, withEntities } from '@ngrx/signals/entities';
import { patchState, signalStore, signalStoreFeature, withMethods, withProps, withState } from '@ngrx/signals';
import { finalize, firstValueFrom, flatMap, lastValueFrom, map, mergeMap, Observable, of } from 'rxjs';
import { ManagedData, XtTypeResolver } from 'xt-type';
import { XtStoreManager } from '../store-manager/xt-store-manager';
import { XtStoreCriteria } from '../xt-store-parameters';
import { StoreState, XtSignalStore, xtStoreEntityConfig } from './store-entity-feature';

export function withXtTypeProvider<T extends ManagedData = ManagedData> (entityName:string, storeMgr:XtStoreManager, typeRegistry: XtTypeResolver) {
  return signalStoreFeature(
    withState ({ entityName, loading:false} as StoreState),
    withEntities(xtStoreEntityConfig<T>()),
    withProps ( () => ({
      _storeProvider:storeMgr.getProviderSafe<T>(entityName),
      _storeMgr:storeMgr,
      _typeResolver:typeRegistry,
      _entityConfig:xtStoreEntityConfig<T>()
    })),
    withMethods ((store) => ({
        async storeEntity(toStore: T): Promise<T> {
          patchState(store, { loading: true });
          return this.clearReferences(toStore).then((valAndRef) => {
            return store._storeProvider.storeEntity(entityName, valAndRef.newValue).then((stored) => {
              return { newValue: stored, references: valAndRef.references };
            });
          }).then((valAndRef) => {
            return this.applyReferences(valAndRef.newValue, valAndRef.references);
          }).then((stored) => {
            patchState(store, setEntity(stored, store._entityConfig));
            return stored;
          }).finally(() => {
            patchState(store, { loading: false });
          });
        },

        fetchEntities(): Promise<void> {
          patchState(store, { loading: true });
          return lastValueFrom(store._storeProvider.searchEntities(entityName).pipe( mergeMap((entities:T[]) => {
            return this.resolveReferences(entities);
          }),map((entities: T[]) => {
            patchState(store, setEntities(entities, store._entityConfig));
          }), finalize(() => {
            patchState(store, { loading: false });
          })));
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
        },

        async loadEntity(id: string): Promise<T | undefined> {
          patchState(store, { loading: true });
          return store._storeProvider.loadEntity(entityName, id).then((loaded) => {
            if (loaded != null)
              return this.resolveReferences([loaded]).then((results) => results[0]);
            return loaded;
          }).then ((loaded) => {
            if (loaded != null)
              patchState(store, setEntity(loaded, store._entityConfig));
            return loaded;
          }).finally(() => {
            patchState(store, { loading: false });
          });
        },

        async safeLoadEntity(id: string): Promise<T> {
          patchState(store, { loading: true });
          return store._storeProvider.loadEntity(entityName, id).then((loaded) => {
            if (loaded != null)
              return this.resolveReferences([loaded]).then((results) => results[0]);
            return loaded;
          }).then((loaded) => {
            if (loaded != null)
              patchState(store, setEntity(loaded, store._entityConfig));
            return loaded;
          }).then((loaded) => {
            if (loaded == null) throw new Error("Entity " + entityName + " with id " + id + " not found");
            return loaded;
          }).finally(() => {
            patchState(store, { loading: false });
          });
        },

        async deleteEntity(id: string): Promise<boolean> {
          patchState(store, { loading: true });
          return store._storeProvider.deleteEntity(entityName, id).then((result) => {
            if (result) {
              patchState(store, removeEntity(id));
            }
            return result;
          }).finally(() => {
            patchState(store, { loading: false });
          });
        },

        async clearReferences(toClear: T): Promise<{ newValue: T, references: any }> {
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

        async resolveReferences(values: T[]): Promise<T[]> {
          const refs = typeRegistry.listReferences(entityName);
          for (const refKey of Object.keys(refs)) {
            const refDef = refs[refKey];
            const refStoreType = signalStore(withXtTypeProvider(refDef.toType, storeMgr, typeRegistry));
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

        async applyReferences(newValue: T, references: ManagedData): Promise<T> {
          if (references != null) {
            // Override the values with the references
            return { ...newValue, ...references } as T;
          } else return newValue;
        }

      }
    )
  )
  )
}
