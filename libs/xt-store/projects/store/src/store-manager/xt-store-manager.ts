import { XtStoreProvider } from '../store-provider/xt-store-provider';
import { Observable } from 'rxjs';
import { UploadedDocumentInfo } from '../xt-document';
import { XtStoreCriteria, XtGroupBy, XtSortBy, XtStoreCriteriaOperator } from '../xt-store-parameters';
import { DontCodeStorePreparedEntities } from '../store-provider/xt-store-provider-helper';
import { XtDataTransformer } from '../store-provider/xt-data-transformer';
import { ManagedData } from 'xt-type';

export class XtStoreManager {
  private _default?: XtStoreProvider<any>;
  private providerByPosition = new Map<string, XtStoreProvider<any>>();
  private providerByType = new Map<string, XtStoreProvider<any>>();

  protected static testProvider:XtStoreProvider<any>|null = null;

  constructor(
    provider?: XtStoreProvider<any>
  ) {
    this._default = provider;
    this.reset();
  }

  reset() {
    this.providerByPosition.clear();
    this.providerByType.clear();
  }

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

  getProviderSafe<T extends ManagedData = ManagedData>(name?: string): XtStoreProvider<T> {
    const ret = this.getProvider<T>(name);
    if (ret == null) {
      throw new Error('Trying to get an undefined or null provider');
    } else {
      return ret;
    }
  }

  getDefaultProvider<T extends ManagedData = ManagedData>(): XtStoreProvider<T> | undefined {
    return this.getProvider();
  }

  getDefaultProviderSafe<T extends ManagedData = ManagedData>(): XtStoreProvider<T> {
    return this.getProviderSafe();
  }

  setProvider<T extends ManagedData = ManagedData>(value: XtStoreProvider<T>, name?: string): void {
    if (name == null) this._default = value;
    else {
      this.providerByPosition.set(name, value);
    }
  }

  setProviderForSourceType<T extends ManagedData = ManagedData>(
    value: XtStoreProvider<T>,
    srcType: string
  ): void {
    this.providerByType.set(srcType, value);
  }

  setDefaultProvider<T extends ManagedData = ManagedData>(value: XtStoreProvider<T>): void {
    this.setProvider(value);
  }

  removeProvider(name?: string): void {
    if (name == null) this._default = undefined;
    else {
      this.providerByPosition.delete(name);
    }
  }

  removeProviderForSourceType(srcType: string): void {
    this.providerByType.delete(srcType);
  }

  removeDefaultProvider(): void {
    this.removeProvider();
  }

  newStoreCriteria(name: string, value: any, operator: XtStoreCriteriaOperator): XtStoreCriteria {
    return new XtStoreCriteria(name, value, operator);
  }

  storeEntity<T extends ManagedData = ManagedData>(name: string, entity: T): Promise<T> {
    return this.getProviderSafe<T>(name).storeEntity(name, entity);
  }

  loadEntity<T extends ManagedData = ManagedData>(name: string, key: any): Promise<T|undefined> {
    return this.getProviderSafe<T>(name).loadEntity(name, key);
  }

  safeLoadEntity<T extends ManagedData = ManagedData>(name: string, key: any): Promise<T> {
    return this.getProviderSafe<T>(name).safeLoadEntity(name, key);
  }

  deleteEntity(name: string, key: any): Promise<boolean> {
    return this.getProviderSafe(name).deleteEntity(name, key);
  }

  searchEntities<T extends ManagedData = ManagedData>(
    name: string,
    ...criteria: XtStoreCriteria[]
  ): Observable<Array<T>> {
    return this.getProviderSafe<T>(name).searchEntities(name, ...criteria);
  }

  searchAndPrepareEntities<T extends ManagedData = ManagedData>(
    name: string,
    sort?:XtSortBy,
    groupBy?:XtGroupBy,
    dataTransformer?:XtDataTransformer,
    ...criteria: XtStoreCriteria[]
  ): Observable<DontCodeStorePreparedEntities<T>> {
    return this.getProviderSafe<T>(name).searchAndPrepareEntities(name, sort, groupBy, dataTransformer, ...criteria);
  }


  canStoreDocument(name?: string): boolean {
    const res = this.getProvider(name)?.canStoreDocument();
    if (res) return res;
    else return false;
  }

  storeDocuments(
    toStore: File[],
    name?: string
  ): Observable<UploadedDocumentInfo> {
    return this.getProviderSafe(name).storeDocuments(toStore);
  }

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
export function xtStoreManager (): XtStoreManager {
  return globalThis.XT_STORE_MGR;
}

globalThis.XT_STORE_MGR = new XtStoreManager();
globalThis.xtStoreManager = xtStoreManager;
