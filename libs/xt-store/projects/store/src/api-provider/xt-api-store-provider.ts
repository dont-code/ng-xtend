import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { map, mergeAll } from 'rxjs/operators';
import { AbstractXtStoreProvider } from '../store-provider/xt-store-provider';
import { XtStoreProviderHelper } from '../store-provider/xt-store-provider-helper';
import { XtStoreCriteria } from '../xt-store-parameters';
import { UploadedDocumentInfo } from '../xt-document';
import { ManagedData, nonTemporaryId } from 'xt-type';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * A Store Provider that uses the DontCode API to store / read application data
 */
@Injectable({
  providedIn: 'root'
})
export class XtApiStoreProvider<T extends ManagedData = ManagedData> extends AbstractXtStoreProvider<T> implements OnDestroy {

  protected http: HttpClient = inject (HttpClient, {optional:true}) as any;

  /** Base URL for data API endpoints. */
  apiUrl: string;

  /** Base URL for document upload endpoints. */
  docUrl: string;

  /** Collection of active subscriptions for cleanup. */
  subscriptions = new Subscription();

  /**
   * @param http - Optional HttpClient instance; if omitted, Angular DI is used
   */
  constructor(http?:HttpClient/* protected configService: CommonConfigService*/) {
    super();
    if (http!=null) {
      this.http=http;
    }

    if (this.http==null) {
      throw new Error ("You must provide an HttpClient, either through constructor or injection.");
    }
    this.apiUrl = 'https://test.dont-code.net/data';
    this.docUrl = 'https://test.dont-code.net/documents';

    /*this.updateConfig (this.configService.getConfig());
    this.subscriptions.add (this.configService.getUpdates ().pipe (map ((updatedConfig) => {
      this.updateConfig (updatedConfig);
    })).subscribe());*/

  }

  /**
   * Clean up subscriptions on service destruction.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

/*  updateConfig(newConfig: Readonly<CommonLibConfig>) {
    if (newConfig.storeApiUrl!=null)
      this.apiUrl = newConfig.storeApiUrl;
    if (newConfig.documentApiUrl!=null)
      this.docUrl = newConfig.documentApiUrl;
  }*/

  /**
   * Stores (creates or updates) an entity via REST API calls.
   * @param name - The entity name
   * @param data - The entity data to store
   * @returns A promise resolving to the stored entity
   */
  storeEntity(name: string, data: T): Promise<T> {

    const id=nonTemporaryId(data);
    // Reconverts dates or Ids
    XtStoreProviderHelper.cleanUpDataBeforeSaving([data],name);

    if( id != undefined) {
      return lastValueFrom(this.http.put<T>(this.apiUrl+'/'+name+'/'+id, data, {observe:"body", responseType:"json"})).then((ret)=> {
        XtStoreProviderHelper.cleanUpLoadedData([ret], name);
        return ret;
      });
    } else {
      return lastValueFrom(this.http.post<T>(this.apiUrl+'/'+name, data, {observe:"body", responseType:"json"})).then((ret)=> {
        XtStoreProviderHelper.cleanUpLoadedData([ret], name);
        return ret;
      });
    }
  }

  /**
   * Loads an entity by its key via a GET request.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity or undefined
   */
  loadEntity(name: string, key: any): Promise<T|undefined> {
    const obs = this.http.get<T>(this.apiUrl+'/'+name+'/'+key, {observe:"body", responseType:"json"});

    return lastValueFrom(obs).then((value) => {
      XtStoreProviderHelper.cleanUpLoadedData([value], name);
      return value;
    });
  }

  /**
   * Deletes an entity by its key via a DELETE request.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to true
   */
  deleteEntity(name: string, key: any): Promise<boolean> {
    return lastValueFrom(this.http.delete(this.apiUrl+'/'+name+'/'+key, {observe:"body", responseType:"json"})).then(value => {
      return true;
    });
    }

  /**
   * Searches entities via a GET request and applies client-side filters.
   * @param name - The entity name
   * @param criteria - Filter criteria to apply
   * @returns An observable emitting the matching entities
   */
  override searchEntities(name: string, ...criteria: XtStoreCriteria<T>[]): Observable<T[]> {

    return this.http.get(this.apiUrl+'/'+name, {observe:"body", responseType:"json"}).pipe(
        map(value => {
          XtStoreProviderHelper.cleanUpLoadedData(value as T [], name);
          return value as T[];
        }),map(value => {
          return XtStoreProviderHelper.applyFilters( value, ...criteria);
        }
      )
    );
    }

  /**
   * Checks whether the API provider supports document storage.
   * @returns Always true
   */
  canStoreDocument(): boolean {
    return true;
  }

  /**
   * Uploads documents to the server via a multipart POST request.
   * @param toStore - The files to upload
   * @returns An observable emitting upload result info for each file
   */
  storeDocuments(toStore: File[]): Observable<UploadedDocumentInfo> {
    const myFormData = new FormData();
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    let count=0;
    // store files details into formdata
    toStore.forEach( file => {
      myFormData.append('document#'+count, file);
      count++;
    });
    //HTTP Angular service, which will send call to Laravel API With headers and myformdata
    return this.http.post<UploadedDocumentInfo[]>(this.docUrl, myFormData, { headers: headers }).pipe(
      mergeAll ()
    );
  }

}
