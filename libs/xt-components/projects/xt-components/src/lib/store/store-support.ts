/**
 * Wrapper around xt-store manager: You can use it to check if xt-store is included or not, and decide what to do
 *
 * This allows plugins to potentially use xt-store whenever included in the applications running the plugin
 */
import { Observable } from 'rxjs';
import { TestStoreCriteria } from '../test/store-test-helper';

export class StoreSupport {

  /** Optional test store manager override for testing */
  protected static testStoreManager?: IStoreManager;

  /**
   * Checks if a store manager is available (either test or global)
   * @returns true if a store manager is available
   */
  static isStoreManagerAvailable () {
    if (this.testStoreManager!=null) return true;
    return ((globalThis as any).xtStoreManager!=undefined);
  }

  /**
   * Gets the current store manager (test or global)
   * @returns The IStoreManager instance
   */
  static getStoreManager (): IStoreManager {
    return this.testStoreManager??((globalThis as any).xtStoreManager());
  }

  /**
   * Sets a test store manager for testing purposes
   * @param testStoreManager - The test store manager to use
   */
  static setTestStoreManager (testStoreManager:IStoreManager): void {
    StoreSupport.testStoreManager = testStoreManager;
  }

  /**
   * Creates a new store criteria for filtering
   * @param name - The property name to filter on
   * @param value - The value to filter by
   * @param operator - The comparison operator (defaults to '=')
   * @returns A new IStoreCriteria instance
   */
  static newStoreCriteria<T = any> (name:keyof T, value:any, operator?:IStoreCriteriaOperator): IStoreCriteria<T> {
    if (operator==null) operator='=';
    return StoreSupport.getStoreManager().newStoreCriteria(name, value, operator);
  }

}

/**
 * Interface definition for xt-store component.
 * We re-define them here to avoid importing xt-store in all plugins that don't need it.
 */


/** Interface for transforming data after it has been loaded from the store */
export interface IDataTransformer<T> {
  /**
   * Enable transformation of data right after it has been loaded from the store
   * @param source
   */
  postLoadingTransformation (source:any[]): T[];

}

/** Information about a stored document */
export interface IDocumentInfo {
  /** The name of the document */
  documentName: string;
  /** Whether the document is accessible via URL */
  isUrl: boolean;
  /** Optional document identifier */
  documentId?: string;
}

/** Supported operators for store criteria comparisons */
export type IStoreCriteriaOperator = '='|'<'|'<=';

/** Criteria for filtering store queries */
export interface IStoreCriteria<T> {
  /** The property name to filter on */
  name: keyof T;
  /** The value to filter by */
  value: any;
  /** The comparison operator */
  operator: IStoreCriteriaOperator;
}

/** Sort criteria for store queries */
export type ISortBy<T> ={
  by:keyof T,
  direction: ISortByDirection
}

/** Sort direction options */
export enum ISortByDirection {
  /** No sorting */
  None = "None",
  /** Sort in ascending order */
  Ascending = "Ascending",
  /** Sort in descending order */
  Descending = "Descending"
}

/** Interface for a store provider that handles CRUD operations on entities */
export interface IStoreProvider<T> {
  /**
   * Stores an entity in the data store
   * @param name - The entity/collection name
   * @param entity - The entity to store
   * @returns A promise that resolves to the stored entity
   */
  storeEntity( name:string, entity: T): Promise<T>;

  /**
   * Rejects the promise if the entity is not found
   * @param name
   * @param key
   */
  /**
   * Rejects the promise if the entity is not found
   * @param name - The entity/collection name
   * @param key - The entity key/ID
   */
  safeLoadEntity( name: string, key: any): Promise<T>;
  /**
   * Loads an entity from the data store
   * @param name - The entity/collection name
   * @param key - The entity key/ID
   * @returns A promise that resolves to the entity or undefined if not found
   */
  loadEntity( name: string, key: any): Promise<T|undefined>;

  /**
   * Deletes an entity from the data store
   * @param name - The entity/collection name
   * @param key - The entity key/ID
   * @returns A promise that resolves to true if deletion was successful
   */
  deleteEntity(name:string, key: any): Promise<boolean>;

  /**
   * Searches for entities matching the given criteria
   * @param name - The entity/collection name
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting matching entities
   */
  searchEntities(
    name: string,
    ...criteria: IStoreCriteria<T>[]
  ): Observable<Array<T>>;

  /**
   * Searches for entities and optionally sorts, groups, and transforms the results
   * @param name - The entity/collection name
   * @param sort - Optional sort criteria
   * @param groupBy - Optional grouping configuration
   * @param transformer - Optional data transformer
   * @param criteria - Additional filter criteria
   * @returns An observable emitting the processed results
   */
  searchAndPrepareEntities(
    name: string,
    sort?:ISortBy<T>,
    groupBy?:any,
    transformer?: IDataTransformer<T>,
    ...criteria: any[]
  ): Observable<any>;

  /**
   * Checks whether this provider can store documents
   * @returns true if document storage is supported
   */
  canStoreDocument(): boolean;

  /**
   * Upload one document to a server store and returns the url or the id needed to retrieve them.
   * @param toStore - The file to upload
   */
  storeDocument(
    toStore: File
  ): Promise<IDocumentInfo>;

  /**
   * Upload documents to a server store and returns the url or the id needed to retrieve them.
   * @param toStore - The files to upload
   */
  storeDocuments(
    toStore: File[]
  ): Observable<IDocumentInfo>;


}

/** Interface for a store manager that provides access to store providers */
export interface IStoreManager {
  /**
   * Gets a store provider by name
   * @param name - Optional provider name (defaults to the default provider)
   * @returns The store provider or undefined if not found
   */
  getProvider<T=never>(name?: string): IStoreProvider<T> | undefined;
  /**
   * Gets a store provider by name, throwing if not found
   * @param name - Optional provider name (defaults to the default provider)
   * @returns The store provider
   * @throws Error if no provider is found
   */
  getProviderSafe<T=never>(name?: string): IStoreProvider<T>;

  /**
   * Gets the default store provider
   * @returns The default provider or undefined if none is set
   */
  getDefaultProvider<T=never>(): IStoreProvider<T> | undefined;

  /**
   * Gets the default store provider, throwing if not found
   * @returns The default store provider
   * @throws Error if no default provider is set
   */
  getDefaultProviderSafe<T=never>(): IStoreProvider<T>;

  /**
   * Creates a new store criteria instance
   * @param name - The property name to filter on
   * @param value - The value to filter by
   * @param operator - The comparison operator
   * @returns A new IStoreCriteria instance
   */
  newStoreCriteria<T=never> (name:keyof T, value:any, operator: IStoreCriteriaOperator): IStoreCriteria<T>;
}
