import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { provideZonelessChangeDetection } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withXtStoreProvider, XtSignalStore } from './store-entity-feature';
import { XtMemoryStoreProvider } from '../store-provider/xt-memory-store-provider';
import { ManagedData } from 'xt-type';

describe('StoreEntityFeature', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  it('should be created', async () => {
    const storeType = signalStore(withXtStoreProvider ("TestProvider", new XtMemoryStoreProvider()));
    const store = new storeType() as XtSignalStore<ManagedData>;

    await store.fetchEntities();
    let listOfEntity = store.entities();
    expect (listOfEntity).toHaveLength(0);

    const added = await store.storeEntity({
      testValue:'testValue',
      added:true
    });
    expect (added._id).toBeTruthy();

    listOfEntity = store.entities();
    expect (listOfEntity).toHaveLength(1);

    await store.storeEntity({ ...added, testValue: 'testValue2' });

    listOfEntity = store.entities();
    expect (listOfEntity[0]["testValue"]).toEqual('testValue2');

    const loaded = await store.loadEntity(added._id!);
    expect(loaded).toBeDefined();
    expect(loaded!["testValue"]).toEqual('testValue2');
  });

  it('should support deleting elements', async () => {
    const provider = new XtMemoryStoreProvider();
    // Create some entities
    provider.storeEntity('TestProvider', {
      testValue:'testValue1',
      added:true
    });
    provider.storeEntity('TestProvider', {
      testValue:'testValue2',
      added:true
    });
    provider.storeEntity('TestProvider', {
      testValue:'testValue3',
      added:true
    });
    const storeType = signalStore(withXtStoreProvider ("TestProvider", provider));
    const store = new storeType() as XtSignalStore<ManagedData>;

    await store.fetchEntities();
    let listOfEntity = store.entities();
    expect(listOfEntity).toHaveLength(3);

    let result = await store.deleteEntity(listOfEntity[1]._id!);
    expect(result).toBeTruthy();
    listOfEntity = store.entities();
    expect(listOfEntity).toHaveLength(2);

    result = await store.deleteEntity(listOfEntity[1]._id!);
    expect(result).toBeTruthy();
    listOfEntity = store.entities();
    expect(listOfEntity).toHaveLength(1);
  });
});
