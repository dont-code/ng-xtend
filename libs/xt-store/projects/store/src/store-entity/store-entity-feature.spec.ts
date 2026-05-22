import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { provideZonelessChangeDetection } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withXtStoreProvider, XtSignalStore } from './store-entity-feature';
import { XtMemoryStoreProvider } from '../store-provider/xt-memory-store-provider';
import { ManagedData, xtTypeManager } from 'xt-type';
import { StoreTestBed } from '../test/store-test-bed';
import { XtSortByDirection, XtStoreCriteria } from '../xt-store-parameters';
import { firstValueFrom } from 'rxjs';

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

  it('should support entity references', async () => {
    StoreTestBed.ensureMemoryProviderOnly();
    const typeMgr = xtTypeManager();
    typeMgr.addRootType('AuthorType', {
      name: 'string',
      birthDate: 'date',
      birthCity: 'string'
    });
    typeMgr.addRootType('BookType', {
      children: {
        title: 'string',
        author: {
          toType:'AuthorType',
          field:'name',
          referenceType: 'MANY-TO-ONE'
        },
        genre: 'string'
      }
    });

    const storeMgr = xtStoreManager();

    const philipKDickAuthor= await storeMgr.getProviderSafe<AuthorType>('AuthorType').storeEntity('AuthorType', {
      name: 'Philip K. Dick',
      birthCity:'Chicago',
      birthDate:new Date (1928, 12, 16)
    });

    const annLeckieAuthor= await storeMgr.getProviderSafe<AuthorType>('AuthorType').storeEntity('AuthorType', {
      name:'Ann Leckie',
      birthCity:'Toledo',
      birthDate:new Date (1966, 3, 2)
    });

    await storeMgr.getProviderSafe<StoredBookType>('BookType').storeEntity('BookType', {
      title:'Ubik',
      author:'Philip K. Dick',
      genre:'SF'
    });

    await storeMgr.getProviderSafe<StoredBookType>('BookType').storeEntity('BookType', {
      title:'Ancillaire',
      author:'Ann Leckie',
      genre:'Space Opera'
    });

    const storeType = signalStore(withXtStoreProvider<BookType> ("BookType", undefined, storeMgr, typeMgr));
    const store = new storeType() as unknown as XtSignalStore<BookType>;

    await store.fetchEntities();
    let listOfEntity = store.entities();
    expect (listOfEntity).toHaveLength(2);

    // Check that the author type reference has been resolved
    const ubikBook = (await firstValueFrom(store.searchEntities(new XtStoreCriteria('title', 'Ubik', '='))))[0];
    expect(ubikBook.author.name).toEqual('Philip K. Dick');

    // Check that when creating a new Book, its reference is correctly removed when saving
    const provenanceBook = await store.storeEntity({
      title:'Provenance',
      author: annLeckieAuthor,
      genre:'Thriller'
    } as BookType);

    expect(provenanceBook.author.birthCity).toEqual(annLeckieAuthor.birthCity);
    // Only the configured author field should be stored
    const storedProvenanceBook=(await firstValueFrom(storeMgr.getProviderSafe<StoredBookType>('BookType').searchEntities('BookType', new XtStoreCriteria('title', 'Provenance','='))))[0];
    expect (storedProvenanceBook.author).toEqual(annLeckieAuthor.name);

    // Check the load by id function is as well managing the references
    const loadedProvenanceBook = (await store.loadEntity(provenanceBook._id!))!;
    expect(loadedProvenanceBook.author._id).toEqual(annLeckieAuthor._id);
  });

  it('should support sorted & filtered store', async () => {
    StoreTestBed.ensureMemoryProviderOnly();
    const typeMgr = xtTypeManager();
    typeMgr.addRootType('AuthorType2', {
      name: 'string',
      birthDate: 'date',
      birthCity: 'string'
    });
    typeMgr.addRootType('BookType2', {
      children: {
        title: 'string',
        author: {
          toType: 'AuthorType2',
          field: 'name',
          referenceType: 'MANY-TO-ONE'
        },
        genre: 'string',
        cost: 'number'
      }
    });

    const storeMgr = xtStoreManager();

    const philipKDickAuthor = await storeMgr.getProviderSafe<AuthorType>('AuthorType2').storeEntity('AuthorType2', {
      name: 'Philip K. Dick',
      birthCity: 'Chicago',
      birthDate: new Date(1928, 12, 16)
    });

    const annLeckieAuthor = await storeMgr.getProviderSafe<AuthorType>('AuthorType2').storeEntity('AuthorType2', {
      name: 'Ann Leckie',
      birthCity: 'Toledo',
      birthDate: new Date(1966, 3, 2)

    });

    await storeMgr.getProviderSafe<StoredBookType2>('BookType2').storeEntity('BookType2', {
      title: 'Ubik',
      author: 'Philip K. Dick',
      genre: 'SF',
      cost:50
    });

    await storeMgr.getProviderSafe<StoredBookType2>('BookType2').storeEntity('BookType2', {
      title: 'Ancillaire',
      author: 'Ann Leckie',
      genre: 'Space Opera',
      cost:70
    });

    await storeMgr.getProviderSafe<StoredBookType2>('BookType2').storeEntity('BookType2', {
      title: 'Sheep',
      author: 'Philip K. Dick',
      genre: 'SF',
      cost:40
    });

    // Let's try first the simple sort / filter
    const storeType = signalStore(withXtStoreProvider<BookType2>("BookType2", undefined, storeMgr, typeMgr, {
      sort: [{
        by: 'title',
        direction:XtSortByDirection.Ascending
      } ],
      filter: [new XtStoreCriteria('genre', 'SF', '=')
      ]
    }));
    const store = new storeType() as unknown as XtSignalStore<BookType2>;
    await store.fetchEntities();
    let result = store.entities();
    expect(result.length).toEqual(2);
    expect(result[0].title).toEqual('Sheep');

    // Now adds an item, and ensure it is put at the right place, and genre is automatically filled
    let added = await store.storeEntity({
        title: 'Tad Book',
        author: annLeckieAuthor,
        cost: 40
      } as BookType2);
    expect(added.genre).toBe('SF');
    result = store.entities();
    expect(result.length).toEqual(3);
    expect(result[1].title).toEqual(added.title);

    let error=false;
    // Storing an entity that doesn't match the filter should not update the list
      const notAdded = await store.storeEntity({
        title: 'Tad Book',
        author: annLeckieAuthor,
        cost: 40,
        genre:'NotGood'
      });
    result = store.entities();
    expect(result).toHaveLength(3);

    // Updating an element should re-trigger sort
    added.title='Aaaa';
    const addedId=added._id;
    added = await store.storeEntity(added);
    expect(added._id).toBe(addedId);
    result = store.entities();
    expect(result.map(val => val.title)).toEqual(['Aaaa', 'Sheep', 'Ubik']);

    // If the updated element is not in the filter anymore, it should be removed from the list
    added.genre='Other';
    added = await store.storeEntity(added);
    result = store.entities();
    expect(result.length).toBe(2);
    expect(result.map(val => val.title)).toEqual(['Sheep', 'Ubik']);

  });
});

type AuthorType=ManagedData&{
  name:string,
  birthCity:string,
  birthDate:Date
}

type BookType =ManagedData&{
  title:string,
  author:AuthorType,
  genre:string
}

type BookType2 = BookType & {
  cost:number
}

type StoredBookType =ManagedData&{
  title:string,
  author:string,
  genre:string
}

type StoredBookType2 = StoredBookType & {
  cost:number
}
