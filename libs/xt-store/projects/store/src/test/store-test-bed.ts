import { XtStoreManager } from '../store-manager/xt-store-manager';
import { XtMemoryStoreProvider } from '../store-provider/xt-memory-store-provider';
import { ManagedData } from 'xt-type';
import { XtStoreProvider } from '../store-provider/xt-store-provider';


export class StoreTestBed {
  readonly storeManager = new XtStoreManager();

  public static ensureMemoryProviderOnly () {
    XtStoreManager.setTestMode(new XtMemoryStoreProvider<ManagedData>());
  }

  public async defineTestDataFor (entityName:string, testData:ManagedData[]): Promise<void> {
    for (const testEntity of testData) {
      await this.storeManager.storeEntity(entityName, testEntity);
    }
  }

  public getStoreManager () {
    return this.storeManager;
  }

  public getStoreProviderFor (entityName:string):XtStoreProvider {
    return this.storeManager.getProviderSafe(entityName);
  }
}
