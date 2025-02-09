import { XtStoreProvider } from '../store-provider/xt-store-provider';
import { Observable } from 'rxjs';
import { UploadedDocumentInfo } from '../xt-document';
import { DontCodeStoreCriteria, DontCodeStoreGroupby, DontCodeStoreSort } from '../xt-store-parameters';
import { DontCodeStorePreparedEntities } from '../store-provider/xt-store-provider-helper';
import { XtDataTransformer } from '../store-provider/xt-data-transformer';

export class XtStoreManager {
  private _default?: XtStoreProvider<never>;
  private providerByPosition = new Map<string, XtStoreProvider<never>>();
  private providerByType = new Map<string, XtStoreProvider<never>>();

  constructor(
    provider?: XtStoreProvider<never>
  ) {
    this._default = provider;
    this.reset();
  }

  reset() {
    this.providerByPosition.clear();
    this.providerByType.clear();
  }

  getProvider<T>(name?: string): XtStoreProvider<T> | undefined {
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

  getProviderSafe<T=never>(name?: string): XtStoreProvider<T> {
    const ret = this.getProvider<T>(name);
    if (ret == null) {
      throw new Error('Trying to get an undefined or null provider');
    } else {
      return ret;
    }
  }

  getDefaultProvider<T=never>(): XtStoreProvider<T> | undefined {
    return this.getProvider();
  }

  getDefaultProviderSafe<T=never>(): XtStoreProvider<T> {
    return this.getProviderSafe();
  }

  setProvider(value: XtStoreProvider<never>, name?: string): void {
    if (name == null) this._default = value;
    else {
      this.providerByPosition.set(name, value);
    }
  }

  setProviderForSourceType(
    value: XtStoreProvider<never>,
    srcType: string
  ): void {
    this.providerByType.set(srcType, value);
  }

  setDefaultProvider(value: XtStoreProvider<never>): void {
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

  storeEntity<T=never>(name: string, entity: T): Promise<T> {
    return this.getProviderSafe<T>(name).storeEntity(name, entity);
  }

  loadEntity<T=never>(name: string, key: any): Promise<T|undefined> {
    return this.getProviderSafe<T>(name).loadEntity(name, key);
  }

  safeLoadEntity<T=never>(name: string, key: any): Promise<T> {
    return this.getProviderSafe<T>(name).safeLoadEntity(name, key);
  }

  deleteEntity(name: string, key: any): Promise<boolean> {
    return this.getProviderSafe(name).deleteEntity(name, key);
  }

  searchEntities<T=never>(
    name: string,
    ...criteria: DontCodeStoreCriteria[]
  ): Observable<Array<T>> {
    return this.getProviderSafe<T>(name).searchEntities(name, ...criteria);
  }

  searchAndPrepareEntities<T=never>(
    name: string,
    sort?:DontCodeStoreSort,
    groupBy?:DontCodeStoreGroupby,
    dataTransformer?:XtDataTransformer,
    ...criteria: DontCodeStoreCriteria[]
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

}

