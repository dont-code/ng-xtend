import { TestBed } from '@angular/core/testing';

import {expect, describe, it, beforeEach, beforeAll} from 'vitest';

import { provideZonelessChangeDetection } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withXtStoreProvider, XtSignalStore } from './store-entity-feature';
import { XtMemoryStoreProvider } from '../store-provider/xt-memory-store-provider';
import { ManagedData } from 'xt-type';
import { setupAngularTestBed } from '../../globalTestSetup';

describe('StoreEntityFeature', () => {

  beforeAll(() => {
    setupAngularTestBed();
  })

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
});
