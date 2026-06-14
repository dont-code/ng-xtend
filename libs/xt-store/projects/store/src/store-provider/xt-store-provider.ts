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
  /**
   * Stores (creates or updates) an entity.
   * @param name - The entity name
   * @param entity - The entity data to store
   * @returns A promise resolving to the stored entity
   */
  storeEntity( name:string, entity: T): Promise<T>;

  /**
   * Loads an entity by its key, rejecting if not found.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity
   */
  safeLoadEntity( name: string, key: any): Promise<T>;

  /**
   * Loads an entity by its key, returning undefined if not found.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity or undefined
   */
  loadEntity( name: string, key: any): Promise<T|undefined>;

  /**
   * Deletes an entity by its key.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to true if deletion succeeded
   */
  deleteEntity(name:string, key: any): Promise<boolean>;

  /**
   * Searches entities matching the given criteria.
   * @param name - The entity name
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting the matching entities
   */
  searchEntities(
    name: string,
    ...criteria: XtStoreCriteria<T>[]
  ): Observable<Array<T>>;

  /**
   * Searches entities and applies sorting, grouping, and transformation.
   * @param name - The entity name
   * @param sort - Optional sort specifications
   * @param groupBy - Optional grouping configuration
   * @param transformer - Optional data transformer
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting the prepared entities
   */
  searchAndPrepareEntities(
    name: string,
    sort?:XtSortBy<T>[],
    groupBy?:XtGroupBy<T>,
    transformer?: XtDataTransformer<T>,
    ...criteria: XtStoreCriteria<T>[]
  ): Observable<DontCodeStorePreparedEntities<T>>;

  /**
   * Checks whether the provider supports document storage.
   * @returns True if document storage is supported
   */
  canStoreDocument(): boolean;

  /**
   * Upload one document to a server store and returns the url or the id needed to retrieve them.
   * @param toStore - The file to upload
   */
  storeDocument(
    toStore: File
  ): Promise<UploadedDocumentInfo>;

  /**
   * Upload documents to a server store and returns the url or the id needed to retrieve them.
   * @param toStore - The files to upload
   */
  storeDocuments(
    toStore: File[]
  ): Observable<UploadedDocumentInfo>;
}

/**
 * Abstract base class for store providers. Provides default implementations for
 * search, filtering, sorting, grouping, and entity lifecycle methods.
 */
export abstract class AbstractXtStoreProvider<T extends ManagedData = ManagedData> implements XtStoreProvider<T> {
  /**
   * Checks whether this provider supports document storage.
   * @returns True if document storage is supported
   */
  abstract canStoreDocument(): boolean;

  /**
   * Deletes an entity by its key.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to true if deletion succeeded
   */
  abstract deleteEntity(name:string, key: any): Promise<boolean>;

  /**
   * Loads an entity by its key, returning undefined if not found.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity or undefined
   */
  abstract loadEntity(name:string, key: any): Promise<T|undefined>;

  constructor () {
  }

  /**
   * Loads an entity by its key, rejecting the promise if not found.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity
   */
  safeLoadEntity(name: string, key: any): Promise<T> {
    return this.loadEntity(name, key).then(value => {
      if (value==null)
        return Promise.reject("Not found");
      else return value;
    })
  }

  /**
   * If the store supports queries with criteria, this function must be implemented, if not, listEntities must be implemented, and this function will apply filters
   * @param name - The entity name
   * @param criteria - Filter criteria to apply
   */
  searchEntities(name: string, ...criteria: XtStoreCriteria<T>[]): Observable<T[]> {
    return this.listEntities(name).pipe(
      map (value => {
        return XtStoreProviderHelper.applyFilters(value, ...criteria) as T[];
      })
    );
  }

  /**
   * Returns the list of entities at a given position in the model. Implements at least this function or searchEntities depending on the capability of the store
   * @param name - The entity name
   * @protected
   */
  protected listEntities (name:string): Observable<T[]> {
    return this.searchEntities(name);
  }

  /**
   * Searches entities, then applies sorting, grouping, and optional data transformation.
   * @param name - The entity name
   * @param sort - Optional sort specifications
   * @param groupBy - Optional grouping configuration
   * @param transformer - Optional data transformer
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting the prepared entities
   */
  searchAndPrepareEntities(name: string, sort?: XtSortBy<T>[], groupBy?: XtGroupBy<T>, transformer?: XtDataTransformer<T>, ...criteria: XtStoreCriteria<T>[]): Observable<DontCodeStorePreparedEntities<T>> {
    return this.searchEntities(name, ...criteria).pipe(
      map (value => {
        // Run the transformation if any
        if (transformer!=null) return transformer.postLoadingTransformation(value);
        else return value;
      }),
      map (value => {
        let groupedByValues:DontCodeStoreGroupedByEntities<T>|undefined;
        if((sort!=null) || (groupBy?.atLeastOneGroupIsRequested()===true)) {
          if (sort!=null) {
            const sortHierarchy=this.calculateSortHierarchy(sort, groupBy);
            if (sortHierarchy!=null)
              value = XtStoreProviderHelper.multiSortArray(value, sortHierarchy) as T[];
          }
          if (groupBy!=null) {
            groupedByValues = XtStoreProviderHelper.calculateGroupedByValues(name, value, groupBy);
          }
        }
        return new DontCodeStorePreparedEntities<T> (value, sort, groupedByValues);
      })
    );
  }

  /**
   * Uploads a single file and returns the document info.
   * @param toStore - The file to upload
   * @returns A promise resolving to the uploaded document info
   */
  storeDocument(toStore: File):Promise<UploadedDocumentInfo> {
    return firstValueFrom(this.storeDocuments([toStore]));
  }

  /**
   * Uploads multiple files and returns an observable of document info.
   * @param toStore - The files to upload
   * @returns An observable emitting upload result info
   */
  abstract storeDocuments(toStore: File[]): Observable<UploadedDocumentInfo>;

  /**
   * Stores (creates or updates) an entity.
   * @param position - The entity name
   * @param entity - The entity data to store
   * @returns A promise resolving to the stored entity
   */
  abstract storeEntity(position: string, entity: T): Promise<T>;


  /**
   * Builds a combined sort hierarchy that prioritises the group-by field first, then
   * appends the user-specified sorts.
   * @param sort - Optional sort specifications
   * @param groupBy - Optional grouping configuration
   * @returns The combined sort array, or undefined if no sorting is needed
   */
  protected calculateSortHierarchy(sort?: XtSortBy<T>[], groupBy?: XtGroupBy<T> ):XtSortBy<T>[]|undefined {
    // We must first sort by the groupBy, and then by the sort
    let rootSort:XtSortBy<T>|undefined;
    if (groupBy!=null) {
      rootSort = new XtStoreSortBy(groupBy.of, undefined);
      if (sort != null) sort.splice(0, 0, rootSort);
      else sort = [rootSort];
    }
    return sort;
  }

}
