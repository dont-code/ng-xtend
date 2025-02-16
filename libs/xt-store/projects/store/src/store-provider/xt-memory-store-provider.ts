import { AbstractXtStoreProvider } from './xt-store-provider';
import { Observable, throwError } from 'rxjs';
import { UploadedDocumentInfo } from '../xt-document';

export class XtMemoryStoreProvider<T extends {_id:string}> extends AbstractXtStoreProvider<T> {
  protected storage=new Map<string, Map<string, T>>();

  canStoreDocument(): boolean {
    return false;
  }

  getSafeStore (name:string):Map<string,T> {
    const ret = this.storage.get(name);
    if (ret==null) {
      throw new Error(`Cannot get store stored with name "${name}".`);
    }else {
      return ret;
    }
  }

  deleteEntity(name: string, key: any): Promise<boolean> {
    const store = this.getSafeStore (name);
    return Promise.resolve(store.delete(key));
  }

  loadEntity(name: string, key: any): Promise<T | undefined> {
    const store = this.getSafeStore (name);
    return Promise.resolve(store.get(key));
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

  storeDocuments(toStore: File[], position: string | undefined): Observable<UploadedDocumentInfo> {
    return throwError (() => {
      throw new Error ("Not implemented.");
    });
  }

}
