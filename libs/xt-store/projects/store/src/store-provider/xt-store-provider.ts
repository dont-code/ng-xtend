import { XtDataTransformer } from './xt-data-transformer';
import { firstValueFrom, map, Observable } from 'rxjs';
import { XtGroupBy, XtSortBy, XtStoreCriteria } from '../xt-store-parameters';
import {
  DontCodeStoreGroupedByEntities,
  DontCodeStorePreparedEntities,
  XtStoreProviderHelper
} from './xt-store-provider-helper';
import { UploadedDocumentInfo } from '../xt-document';
import { XtStoreSortBy } from '../xt-reporting';
import { ManagedData } from 'xt-type';
import { Injectable } from '@angular/core';

/**
 * The standard interface for any store provider
 */
export type XtStoreProvider<T extends ManagedData = ManagedData>= {
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
    ...criteria: XtStoreCriteria[]
  ): Observable<Array<T>>;

  searchAndPrepareEntities(
    name: string,
    sort?:XtSortBy,
    groupBy?:XtGroupBy,
    transformer?: XtDataTransformer<T>,
    ...criteria: XtStoreCriteria[]
  ): Observable<DontCodeStorePreparedEntities<T>>;

  canStoreDocument(): boolean;

  /**
   * Upload one document to a server store and returns the url or the id needed to retrieve them.
   * @param toStore
   * @param position
   */
  storeDocument(
    toStore: File
  ): Promise<UploadedDocumentInfo>;

  /**
   * Upload documents to a server store and returns the url or the id needed to retrieve them.
   * @param toStore
   * @param position
   */
  storeDocuments(
    toStore: File[]
  ): Observable<UploadedDocumentInfo>;
}

export abstract class AbstractXtStoreProvider<T extends ManagedData = ManagedData> implements XtStoreProvider<T> {
  abstract canStoreDocument(): boolean;

  abstract deleteEntity(name:string, key: any): Promise<boolean>;

  abstract loadEntity(name:string, key: any): Promise<T|undefined>;

  constructor () {
  }

  safeLoadEntity(name: string, key: any): Promise<T> {
    return this.loadEntity(name, key).then(value => {
      if (value==null)
        return Promise.reject("Not found");
      else return value;
    })
  }

  /**
   * If the store supports queries with criteria, this function must be implemented, if not, listEntities must be implemented, and this function will apply filters
   * @param position
   * @param criteria
   */
  searchEntities(name: string, ...criteria: XtStoreCriteria[]): Observable<T[]> {
    return this.listEntities(name).pipe(
      map (value => {
        return XtStoreProviderHelper.applyFilters(value, ...criteria) as T[];
      })
    );
  }

  /**
   * Returns the list of entities at a given position in the model. Implements at least this function or searchEntities depending on the capability of the store
   * @param position
   * @protected
   */
  protected listEntities (name:string): Observable<T[]> {
    return this.searchEntities(name);
  }

  searchAndPrepareEntities(name: string, sort?: XtSortBy, groupBy?: XtGroupBy, transformer?: XtDataTransformer<T>, ...criteria: XtStoreCriteria[]): Observable<DontCodeStorePreparedEntities<T>> {
    return this.searchEntities(name, ...criteria).pipe(
      map (value => {
        // Run the transformation if any
        if (transformer!=null) return transformer.postLoadingTransformation(value);
        else return value;
      }),
      map (value => {
        let groupedByValues:DontCodeStoreGroupedByEntities|undefined;
        if((sort!=null) || (groupBy?.atLeastOneGroupIsRequested()===true)) {
          value = XtStoreProviderHelper.multiSortArray(value, this.calculateSortHierarchy(sort, groupBy)) as T[];
          if (groupBy!=null) {
            groupedByValues = XtStoreProviderHelper.calculateGroupedByValues(name, value, groupBy);
          }
        }
        return new DontCodeStorePreparedEntities<T> (value, sort, groupedByValues);
      })
    );
  }

  storeDocument(toStore: File):Promise<UploadedDocumentInfo> {
    return firstValueFrom(this.storeDocuments([toStore]));
  }

  abstract storeDocuments(toStore: File[]): Observable<UploadedDocumentInfo>;

  abstract storeEntity(position: string, entity: T): Promise<T>;


  protected calculateSortHierarchy(sort?: XtSortBy, groupBy?: XtGroupBy ):XtSortBy|undefined {
    // We must first sort by the groupBy, and then by the sort
    let rootSort:XtSortBy|undefined;
    if (groupBy!=null) {
      rootSort=new XtStoreSortBy(groupBy.of, undefined, sort);
    } else {
      rootSort=sort;
    }
    return rootSort;
  }

}
