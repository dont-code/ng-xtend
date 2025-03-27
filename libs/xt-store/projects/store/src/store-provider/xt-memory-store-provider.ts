import { AbstractXtStoreProvider } from './xt-store-provider';
import { Observable, of, throwError } from 'rxjs';
import { UploadedDocumentInfo } from '../xt-document';
import { ManagedData } from 'xt-type/src';

export class XtMemoryStoreProvider<T extends ManagedData> extends AbstractXtStoreProvider<T> {
  protected storage=new Map<string, Map<string, T>>();

  override canStoreDocument(): boolean {
    return false;
  }

  getSafeStore (name:string):Map<string,T> {
    let ret = this.storage.get(name);
    if (ret==null) {
      ret = new Map<string, T>();
      this.storage.set(name, ret);
    }
    return ret;
  }

  deleteEntity(name: string, key: any): Promise<boolean> {
    const store = this.getSafeStore (name);
    return Promise.resolve(store.delete(key));
  }

  loadEntity(name: string, key: any): Promise<T | undefined> {
    const store = this.getSafeStore (name);
    return Promise.resolve(store.get(key));
  }

  override listEntities(name: string): Observable<T[]> {
    const store = this.getSafeStore (name);
    //console.debug("Listing entities for "+name+" with ",store);
    return of (Array.from(store.values()));
  }

  storeEntity(name: string, entity: T): Promise<T> {
    const store = this.getSafeStore (name);
    if (entity._id==null) {
      entity._id = Math
        .random().toString(36).substring(2, 8);
    }
    store.set(entity._id, entity);
    return Promise.resolve(entity);
  }

  override storeDocuments(toStore: File[]): Observable<UploadedDocumentInfo> {
    return throwError (() => {
      throw new Error ("Not implemented.");
    });
  }

}
