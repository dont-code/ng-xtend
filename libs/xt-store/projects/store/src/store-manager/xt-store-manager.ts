import { XtStoreProvider } from '../store-provider/xt-store-provider';
import { Observable } from 'rxjs';
import { UploadedDocumentInfo } from '../xt-document';
import { XtStoreCriteria, XtGroupBy, XtSortBy, XtStoreCriteriaOperator } from '../xt-store-parameters';
import { DontCodeStorePreparedEntities } from '../store-provider/xt-store-provider-helper';
import { XtDataTransformer } from '../store-provider/xt-data-transformer';
import { ManagedData } from 'xt-type';

/**
 * Central manager for XtStore providers. Routes store operations to the appropriate provider
 * based on entity name or source type, and supports test-mode provider overrides.
 */
export class XtStoreManager {
  private _default?: XtStoreProvider<any>;
  private providerByPosition = new Map<string, XtStoreProvider<any>>();
  private providerByType = new Map<string, XtStoreProvider<any>>();

  protected static testProvider:XtStoreProvider<any>|null = null;

  /**
   * @param provider - Optional default store provider
   */
  constructor(
    provider?: XtStoreProvider<any>
  ) {
    this._default = provider;
    this.reset();
  }

  /**
   * Clears all registered providers by position and source type.
   */
  reset() {
    this.providerByPosition.clear();
    this.providerByType.clear();
  }

  /**
   * Retrieves a provider by entity name, falling back to the default provider.
   * @param name - Optional entity name to look up a specific provider
   * @returns The matching provider, or the default if available
   */
  getProvider<T extends ManagedData = ManagedData>(name?: string): XtStoreProvider<T> | undefined {
    // Override for testing
    if( XtStoreManager.testProvider!=null) return XtStoreManager.testProvider;

    if (name == null) {
      return this._default;
    } else {
      let ret = null;
      // Try to find if the entity is loaded from a defined source
      /*const srcDefinition = this.modelMgr.findTargetOfProperty(
        DontCodeModel.APP_ENTITIES_FROM_NODE,
        position
      )?.value as DontCodeSourceType;
      if (srcDefinition) {
        ret = this.providerByType.get(srcDefinition.type);
      }
      if (!ret) {*/
        ret = this.providerByPosition.get(name);
      //}
      return ret ?? this._default;
    }
  }

  /**
   * Retrieves a provider by entity name, throwing if none is found.
   * @param name - Optional entity name
   * @returns The matching provider
   * @throws Error if no provider is found
   */
  getProviderSafe<T extends ManagedData = ManagedData>(name?: string): XtStoreProvider<T> {
    const ret = this.getProvider<T>(name);
    if (ret == null) {
      throw new Error('Trying to get an undefined or null provider');
    } else {
      return ret;
    }
  }

  /**
   * Returns the default store provider.
   * @returns The default provider, or undefined if not set
   */
  getDefaultProvider<T extends ManagedData = ManagedData>(): XtStoreProvider<T> | undefined {
    return this.getProvider();
  }

  /**
   * Returns the default store provider, throwing if none is set.
   * @returns The default provider
   * @throws Error if no default provider is available
   */
  getDefaultProviderSafe<T extends ManagedData = ManagedData>(): XtStoreProvider<T> {
    return this.getProviderSafe();
  }

  /**
   * Registers a provider, optionally associated with a specific entity name.
   * @param value - The store provider to register
   * @param name - Optional entity name; if omitted the provider becomes the default
   */
  setProvider<T extends ManagedData = ManagedData>(value: XtStoreProvider<T>, name?: string): void {
    if (name == null) this._default = value;
    else {
      this.providerByPosition.set(name, value);
    }
  }

  /**
   * Registers a provider for a given source type.
   * @param value - The store provider to register
   * @param srcType - The source type identifier
   */
  setProviderForSourceType<T extends ManagedData = ManagedData>(
    value: XtStoreProvider<T>,
    srcType: string
  ): void {
    this.providerByType.set(srcType, value);
  }

  /**
   * Sets the default store provider.
   * @param value - The provider to set as default
   */
  setDefaultProvider<T extends ManagedData = ManagedData>(value: XtStoreProvider<T>): void {
    this.setProvider(value);
  }

  /**
   * Removes a registered provider by entity name.
   * @param name - Optional entity name; if omitted removes the default provider
   */
  removeProvider(name?: string): void {
    if (name == null) this._default = undefined;
    else {
      this.providerByPosition.delete(name);
    }
  }

  /**
   * Removes the provider registered for a given source type.
   * @param srcType - The source type identifier
   */
  removeProviderForSourceType(srcType: string): void {
    this.providerByType.delete(srcType);
  }

  /**
   * Removes the default store provider.
   */
  removeDefaultProvider(): void {
    this.removeProvider();
  }

  /**
   * Creates a new store criteria instance for filtering.
   * @param name - The field name to filter on
   * @param value - The value to match
   * @param operator - The comparison operator
   * @returns A new XtStoreCriteria instance
   */
  newStoreCriteria<T extends ManagedData>(name: string, value: any, operator: XtStoreCriteriaOperator): XtStoreCriteria<T> {
    return new XtStoreCriteria<T>(name, value, operator);
  }

  /**
   * Stores (creates or updates) an entity via the appropriate provider.
   * @param name - The entity name
   * @param entity - The entity data to store
   * @returns A promise resolving to the stored entity
   */
  storeEntity<T extends ManagedData = ManagedData>(name: string, entity: T): Promise<T> {
    return this.getProviderSafe<T>(name).storeEntity(name, entity);
  }

  /**
   * Loads an entity by its key. Returns undefined if not found.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity or undefined
   */
  loadEntity<T extends ManagedData = ManagedData>(name: string, key: any): Promise<T|undefined> {
    return this.getProviderSafe<T>(name).loadEntity(name, key);
  }

  /**
   * Loads an entity by its key, rejecting if not found.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity
   * @throws If the entity is not found
   */
  safeLoadEntity<T extends ManagedData = ManagedData>(name: string, key: any): Promise<T> {
    return this.getProviderSafe<T>(name).safeLoadEntity(name, key);
  }

  /**
   * Deletes an entity by its key.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to true if deletion succeeded
   */
  deleteEntity(name: string, key: any): Promise<boolean> {
    return this.getProviderSafe(name).deleteEntity(name, key);
  }

  /**
   * Searches entities matching the given criteria.
   * @param name - The entity name
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting the matching entities
   */
  searchEntities<T extends ManagedData = ManagedData>(
    name: string,
    ...criteria: XtStoreCriteria<T>[]
  ): Observable<Array<T>> {
    return this.getProviderSafe<T>(name).searchEntities(name, ...criteria);
  }

  /**
   * Searches entities and applies sorting, grouping, and data transformation.
   * @param name - The entity name
   * @param sort - Optional sort specifications
   * @param groupBy - Optional grouping configuration
   * @param dataTransformer - Optional data transformer
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting the prepared entities
   */
  searchAndPrepareEntities<T extends ManagedData = ManagedData>(
    name: string,
    sort?:XtSortBy<T>[],
    groupBy?:XtGroupBy<T>,
    dataTransformer?:XtDataTransformer,
    ...criteria: XtStoreCriteria<T>[]
  ): Observable<DontCodeStorePreparedEntities<T>> {
    return this.getProviderSafe<T>(name).searchAndPrepareEntities(name, sort, groupBy, dataTransformer, ...criteria);
  }


  /**
   * Checks if the provider for the given entity supports document storage.
   * @param name - Optional entity name
   * @returns True if document storage is supported
   */
  canStoreDocument(name?: string): boolean {
    const res = this.getProvider(name)?.canStoreDocument();
    if (res) return res;
    else return false;
  }

  /**
   * Uploads documents via the provider.
   * @param toStore - The files to upload
   * @param name - Optional entity name
   * @returns An observable emitting upload result info
   */
  storeDocuments(
    toStore: File[],
    name?: string
  ): Observable<UploadedDocumentInfo> {
    return this.getProviderSafe(name).storeDocuments(toStore);
  }

  /**
   * Sets a test provider, overriding all normal provider resolution.
   * @param testProvider - The provider to use during tests
   */
  public static setTestMode (testProvider:XtStoreProvider<any>) {
    this.testProvider=testProvider;
  }

}

/**
 * The global store Mgr
 */

declare global {
  var XT_STORE_MGR: XtStoreManager;
  var xtStoreManager: () => XtStoreManager;
}
/**
 * Returns the global XtStoreManager singleton.
 * @returns The global store manager instance
 */
export function xtStoreManager (): XtStoreManager {
  return globalThis.XT_STORE_MGR;
}

globalThis.XT_STORE_MGR = new XtStoreManager();
globalThis.xtStoreManager = xtStoreManager;
