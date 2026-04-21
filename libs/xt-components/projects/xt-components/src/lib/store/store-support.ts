/**
 * Wrapper around xt-store manager: You can use it to check if xt-store is included or not, and decide what to do
 *
 * This allows plugins to potentially use xt-store whenever included in the applications running the plugin
 */
import { Observable } from 'rxjs';
import { TestStoreCriteria } from '../test/store-test-helper';

export class StoreSupport {

  protected static testStoreManager?: IStoreManager;

  static isStoreManagerAvailable () {
    if (this.testStoreManager!=null) return true;
    return ((globalThis as any).xtStoreManager!=undefined);
  }

  static getStoreManager (): IStoreManager {
    return this.testStoreManager??((globalThis as any).xtStoreManager());
  }

  static setTestStoreManager (testStoreManager:IStoreManager): void {
    StoreSupport.testStoreManager = testStoreManager;
  }

  static newStoreCriteria<T = any> (name:keyof T, value:any, operator?:IStoreCriteriaOperator): IStoreCriteria<T> {
    if (operator==null) operator='=';
    return StoreSupport.getStoreManager().newStoreCriteria(name, value, operator);
  }

}

/**
 * Interface definition for xt-store component.
 * We re-define them here to avoid importing xt-store in all plugins that don't need it.
 */


export interface IDataTransformer<T> {
  /**
   * Enable transformation of data right after it has been loaded from the store
   * @param source
   */
  postLoadingTransformation (source:any[]): T[];

}

export interface IDocumentInfo {
  documentName: string;
  isUrl: boolean;
  documentId?: string;
}

export type IStoreCriteriaOperator = '='|'<'|'<=';

export interface IStoreCriteria<T> {
  name: keyof T;
  value: any;
  operator: IStoreCriteriaOperator;
}

export type ISortBy<T> ={
  by:keyof T,
  direction: ISortByDirection
}

export enum ISortByDirection {
  None = "None",
  Ascending = "Ascending",
  Descending = "Descending"
}

export interface IStoreProvider<T> {
  storeEntity( name:string, entity: T): Promise<T>;

  /**
   * Rejects the promise if the entity is not found
   * @param name
   * @param key
   */
  safeLoadEntity( name: string, key: any): Promise<T>;
  loadEntity( name: string, key: any): Promise<T|undefined>;

  deleteEntity(name:string, key: any): Promise<boolean>;

  searchEntities(
    name: string,
    ...criteria: IStoreCriteria<T>[]
  ): Observable<Array<T>>;

  searchAndPrepareEntities(
    name: string,
    sort?:ISortBy<T>,
    groupBy?:any,
    transformer?: IDataTransformer<T>,
    ...criteria: any[]
  ): Observable<any>;

  canStoreDocument(): boolean;

  /**
   * Upload one document to a server store and returns the url or the id needed to retrieve them.
   * @param toStore
   * @param position
   */
  storeDocument(
    toStore: File
  ): Promise<IDocumentInfo>;

  /**
   * Upload documents to a server store and returns the url or the id needed to retrieve them.
   * @param toStore
   * @param position
   */
  storeDocuments(
    toStore: File[]
  ): Observable<IDocumentInfo>;


}

export interface IStoreManager {
  getProvider<T=never>(name?: string): IStoreProvider<T> | undefined;
  getProviderSafe<T=never>(name?: string): IStoreProvider<T>;

  getDefaultProvider<T=never>(): IStoreProvider<T> | undefined;

  getDefaultProviderSafe<T=never>(): IStoreProvider<T>;

  newStoreCriteria<T=never> (name:keyof T, value:any, operator: IStoreCriteriaOperator): IStoreCriteria<T>;
}
