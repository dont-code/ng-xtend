import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { provideZonelessChangeDetection } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { XtSignalStore } from './store-entity-feature';
import { ManagedData, xtTypeManager } from 'xt-type';
import { withXtTypeProvider } from './store-entity-ref-feature';
import { StoreTestBed } from '../test/store-test-bed';
import { firstValueFrom } from 'rxjs';
import { XtStoreCriteria } from '../xt-store-parameters';

describe('StoreEntityFeature with reference resolution', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  it('should be created', async () => {
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

    const storeType = signalStore(withXtTypeProvider<BookType> ("BookType", storeMgr, typeMgr));
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

type StoredBookType =ManagedData&{
  title:string,
  author:string,
  genre:string
}
