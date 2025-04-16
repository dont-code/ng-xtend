import { Injectable } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { ManagedData } from 'xt-type';
import { XtStoreManager } from '../store-manager/xt-store-manager';
import { withXtStoreProvider, XtSignalStore } from '../store-entity/store-entity-feature';
import { XtStoreProvider } from '../store-provider/xt-store-provider';

@Injectable({
  providedIn: 'root'
})
export class StoreManagerService {

  protected storeManager = new XtStoreManager();
  protected entityToStoreMap = new Map<string, XtSignalStore<ManagedData>>();

  constructor() {
  }

  getStoreFor(entityName: string): XtSignalStore<ManagedData> {
    let store = this.entityToStoreMap.get(entityName);
    if (store == null) {
      const provider = this.storeManager.getProvider<ManagedData>(entityName);
      if (provider == null) {
        throw new Error('No provider found for entity ' + entityName);
      } else {
        const res = signalStore(
          withXtStoreProvider(entityName, provider)
        );
        store= new res();
      }
      this.entityToStoreMap.set(entityName, store);
    }
    return store;
  }

setDefaultStoreProvider (provider: XtStoreProvider<ManagedData>) {
    this.storeManager.setDefaultProvider(provider);
  }
}
