import {
  XtGroupBy,
  XtSortBy,
  XtStoreCriteria
} from '../xt-store-parameters';
import { AbstractXtStoreProvider } from '../store-provider/xt-store-provider';
import { Observable, of } from 'rxjs';
import { DontCodeStorePreparedEntities } from '../store-provider/xt-store-provider-helper';
import { XtStoreManager } from './xt-store-manager';
import { XtDataTransformer } from '../store-provider/xt-data-transformer';
import { UploadedDocumentInfo } from '../xt-document';
import { describe, expect, it } from 'vitest';
import { ManagedData } from 'xt-type';

describe('Store Manager', () => {
  it('should correctly return the default provider', () => {
    const storeManager = new XtStoreManager();
    const defaultProvider = new DummyStoreProvider<never>();

    storeManager.setProvider(defaultProvider);
    expect(storeManager.getProvider() == defaultProvider).toBeTruthy();
    expect(storeManager.getDefaultProvider() == defaultProvider).toBeTruthy();
    expect(
      storeManager.getProvider('anyposition') == defaultProvider
    ).toBeTruthy();

    const newProvider = new DummyStoreProvider<never>();
    storeManager.setDefaultProvider(newProvider);
    expect(storeManager.getProvider() == newProvider).toBeTruthy();
    expect(storeManager.getDefaultProvider() == newProvider).toBeTruthy();
    expect(storeManager.getProvider('anyposition') == newProvider).toBeTruthy();

    storeManager.removeProvider();
    try {
      storeManager.getDefaultProviderSafe();
      expect(false).toBeTruthy();
    } catch (error) {
      // ok
    }
  });

  it('should correctly return other providers', () => {
    const storeManager = new XtStoreManager();
    const defaultProvider = new DummyStoreProvider<never>();
    const testProvider = new DummyStoreProvider<never>();

    storeManager.setProvider(defaultProvider);
    storeManager.setProvider(testProvider, 'test/position');
    expect(storeManager.getDefaultProvider() == defaultProvider).toBeTruthy();
    expect(
      storeManager.getProvider('anyposition') == defaultProvider
    ).toBeTruthy();
    expect(
      storeManager.getProvider('test/position') == testProvider
    ).toBeTruthy();

    const newProvider = new DummyStoreProvider<never>();
    storeManager.setProvider(newProvider, 'test/position');
    expect(
      storeManager.getProvider('test/position') == newProvider
    ).toBeTruthy();

    storeManager.removeProvider('test/position');
    expect(
      storeManager.getProvider('test/position') == defaultProvider
    ).toBeTruthy();
  });
});

class DummyStoreProvider<T extends ManagedData = ManagedData> extends AbstractXtStoreProvider<T> {
  canStoreDocument(): boolean {
    return false;
  }

  deleteEntity(name: string, key: any): Promise<boolean> {
    return Promise.resolve(false);
  }

  loadEntity(name: string, key: any): Promise<T> {
    return Promise.reject();
  }

  override searchEntities(
    name: string,
    ...criteria: XtStoreCriteria[]
  ): Observable<Array<T>> {
    return of([]);
  }
  override searchAndPrepareEntities(name: string, sort?: XtSortBy | undefined, groupBy?: XtGroupBy | undefined, transformer?:XtDataTransformer,...criteria: XtStoreCriteria[]): Observable<DontCodeStorePreparedEntities<T>> {
    return of (new DontCodeStorePreparedEntities([]));
  }

  storeDocuments(
    toStore: File[]
  ): Observable<UploadedDocumentInfo> {
    return of({
      documentId:'areere',
      documentName: 'atgegtrgtr',
      isUrl: false
    });
  }

  storeEntity(name: string, entity: T): Promise<T> {
    return Promise.resolve(entity);
  }
}
