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

  apiUrl: string;
  docUrl: string;
  subscriptions = new Subscription();

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

/*  updateConfig(newConfig: Readonly<CommonLibConfig>) {
    if (newConfig.storeApiUrl!=null)
      this.apiUrl = newConfig.storeApiUrl;
    if (newConfig.documentApiUrl!=null)
      this.docUrl = newConfig.documentApiUrl;
  }*/

  storeEntity(name: string, data: T): Promise<T> {

    const id=nonTemporaryId(data);
    // Reconverts dates or Ids
    XtStoreProviderHelper.cleanUpDataBeforeSaving([data],name);

    if( id != undefined) {
      return lastValueFrom(this.http.put<T>(this.apiUrl+'/'+name+'/'+id, data, {observe:"body", responseType:"json"}));
    } else {
      return lastValueFrom(this.http.post<T>(this.apiUrl+'/'+name, data, {observe:"body", responseType:"json"}));
    }
  }

  loadEntity(name: string, key: any): Promise<T|undefined> {
    const obs = this.http.get<T>(this.apiUrl+'/'+name+'/'+key, {observe:"body", responseType:"json"});

    return lastValueFrom(obs).then((value) => {
      XtStoreProviderHelper.cleanUpLoadedData([value], name);
      return value;
    });
  }

  deleteEntity(name: string, key: any): Promise<boolean> {
    return lastValueFrom(this.http.delete(this.apiUrl+'/'+name+'/'+key, {observe:"body", responseType:"json"})).then(value => {
      return true;
    });
    }

  override searchEntities(name: string, ...criteria: XtStoreCriteria[]): Observable<T[]> {

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

  canStoreDocument(): boolean {
    return true;
  }

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
