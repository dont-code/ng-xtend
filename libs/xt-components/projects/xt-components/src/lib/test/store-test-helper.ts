import { from, Observable } from 'rxjs';
import { IDataTransformer, IDocumentInfo, IStoreManager, IStoreProvider, StoreSupport } from '../store/store-support';
import { uuid } from '@primeuix/utils';

/**
 * A very light and not 100% compatible storemanager in case you are not using xt-store.
 * It can emulate XtStoreManager to some extends for doing some tests
 */
export class StoreTestHelper {
  public static ensureTestProviderOnly() {
    StoreSupport.setTestStoreManager(new TestStoreManager());
  }
}

export class TestStoreManager implements IStoreManager {
  protected defaultProvider= new TestStoreProvider();

  getProvider<T = never>(name?: string): IStoreProvider<T> | undefined {
    return this.defaultProvider;
  }

  getProviderSafe<T = never>(name?: string): IStoreProvider<T> {
    return this.defaultProvider;
  }

  getDefaultProvider<T = never>(): IStoreProvider<T> | undefined {
    return this.defaultProvider;
  }

  getDefaultProviderSafe<T = never>(): IStoreProvider<T> {
    return this.defaultProvider;
  }

}

export class TestStoreProvider<T = never> implements IStoreProvider<T> {
    protected data = new Map<string, Map<string,any>> ();

    protected getOrCreateArray (name: string): Map<string,T> {
      let ret=this.data.get(name);
      if (ret==null) {
        ret = new Map<string, T>();
        this.data.set(name, ret);
      }
      return ret;
    }

    protected extractKey (value: any, create?:boolean):string {
      if (value._id!=null) return value._id; // ManagedData key
      else if (value.id!=null) return value.id;
      else {
        if (create===true) {
          const newId = new Date().getTime().toString();
          value._id=newId;
          return newId;
        }
        return value.toString();
      }
    }

    storeEntity(name: string, entity: T): Promise<T> {
      this.getOrCreateArray(name).set(this.extractKey(entity, true), entity);
      return Promise.resolve(entity);
    }

    safeLoadEntity(name: string, key: any): Promise<T> {
        const ret = this.getOrCreateArray(name).get(key);
        if (ret==null) {
          throw new Error ("No entity named "+name+" with key "+key);
        }
        return Promise.resolve(ret);
    }

    loadEntity(name: string, key: any): Promise<T | undefined> {
      return Promise.resolve(this.getOrCreateArray(name).get(key));
    }

    deleteEntity(name: string, key: any): Promise<boolean> {
        return Promise.resolve( this.getOrCreateArray(name).delete(key));
    }

    searchEntities(name: string, ...criteria: any[]): Observable<T[]> {
      if ((criteria!=null) && (criteria.length>0)) {
        throw new Error('Method not implemented.');
      }
      // No criteria defined, just send the full list
      const ret=new Array<T>();
      for (const toAdd of this.getOrCreateArray(name).values()) {
        ret.push(toAdd);
      }
      return from([ret]);
    }

    searchAndPrepareEntities(name: string, sort?: any, groupBy?: any, transformer?: IDataTransformer<T> | undefined, ...criteria: any[]): Observable<any> {
        throw new Error('Method not implemented.');
    }
    canStoreDocument(): boolean {
        return true;
    }
    storeDocument(toStore: File): Promise<IDocumentInfo> {
      const ret = new TestDocumentInfo(toStore.name, true,URL.createObjectURL(toStore));
      return Promise.resolve(ret);
    }

    storeDocuments(toStore: File[]): Observable<IDocumentInfo> {
        throw new Error('Method not implemented.');
    }

}

export class TestDocumentInfo implements IDocumentInfo {
  documentName: string;
  isUrl: boolean;
  documentId?: string;

  constructor(documentName: string, isUrl: boolean,documentId?: string) {
    this.documentId = documentId;
    this.documentName = documentName;
    this.isUrl = isUrl;
  }
}
