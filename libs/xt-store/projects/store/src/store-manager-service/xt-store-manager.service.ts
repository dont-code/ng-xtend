import { Injectable } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { ManagedData, XtTypeResolver } from 'xt-type';
import { xtStoreManager } from '../store-manager/xt-store-manager';
import { withXtStoreProvider, XtSignalStore, XtStoreEntityFeatureOptions } from '../store-entity/store-entity-feature';
import { XtStoreProvider } from '../store-provider/xt-store-provider';

/**
 * Angular service that provides managed SignalStore instances for entities,
 * backed by the global XtStoreManager provider resolution.
 */
@Injectable({
  providedIn: 'root'
})
export class XtStoreManagerService {

  protected storeManager = xtStoreManager();
  protected entityToStoreMap = new Map<string, XtSignalStore<ManagedData>>();

  constructor() {
  }

  /**
   * Retrieves or creates a SignalStore for the given entity name.
   * @param entityName - The entity name
   * @param typeMgr - Optional type resolver for reference management
   * @param options - Optional store feature options (sort, filter)
   * @returns A SignalStore instance for the entity
   */
  getStoreFor<T extends ManagedData>(entityName: string, typeMgr?:XtTypeResolver, options?:XtStoreEntityFeatureOptions<T>): XtSignalStore<T> {
    let store = this.entityToStoreMap.get(entityName);
    if (store == null) {
      const provider = this.storeManager.getProvider<T>(entityName);
      if (provider == null) {
        throw new Error('No provider found for entity ' + entityName);
      } else {
        if( typeMgr==null) {
          const res = signalStore(
            withXtStoreProvider(entityName, provider, undefined, undefined, options)
          );
          store= new res();
        } else {
            // We have a type mgr, so let's use it in our store
          const res = signalStore(
            withXtStoreProvider(entityName, provider, this.storeManager, typeMgr, options)
          );
          store= new res();

        }
      }
      this.entityToStoreMap.set(entityName, store);
    }
    return store as XtSignalStore<T>;
  }

  /**
   * Sets the default store provider for all entities.
   * @param provider - The provider to set as the global default
   */
  setDefaultStoreProvider (provider: XtStoreProvider<ManagedData>) {
    this.storeManager.setDefaultProvider(provider);
  }
}
