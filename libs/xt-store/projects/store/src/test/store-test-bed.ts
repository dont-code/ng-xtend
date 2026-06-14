import { XtStoreManager } from '../store-manager/xt-store-manager';
import { XtMemoryStoreProvider } from '../store-provider/xt-memory-store-provider';
import { ManagedData } from 'xt-type';
import { XtStoreProvider } from '../store-provider/xt-store-provider';


/**
 * Test utility that sets up an in-memory store environment and provides helpers
 * for defining and accessing test data.
 */
export class StoreTestBed {
  readonly storeManager = xtStoreManager();

  /**
   * Configures the global store manager to use an in-memory provider for testing.
   */
  public static ensureMemoryProviderOnly () {
    XtStoreManager.setTestMode(new XtMemoryStoreProvider<ManagedData>());
  }

  /**
   * Stores test data entries for the given entity name.
   * @param entityName - The entity name to store data under
   * @param testData - Array of test entities to store
   */
  public async defineTestDataFor (entityName:string, testData:ManagedData[]): Promise<void> {
    for (const testEntity of testData) {
      await this.storeManager.storeEntity(entityName, testEntity);
    }
  }

  /**
   * Returns the underlying store manager instance.
   * @returns The store manager
   */
  public getStoreManager () {
    return this.storeManager;
  }

  /**
   * Returns the store provider for a given entity name.
   * @param entityName - The entity name
   * @returns The matching store provider
   */
  public getStoreProviderFor (entityName:string):XtStoreProvider {
    return this.storeManager.getProviderSafe(entityName);
  }
}
