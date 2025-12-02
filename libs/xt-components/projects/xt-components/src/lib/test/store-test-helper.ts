import { from, Observable } from 'rxjs';
import {
  IDataTransformer,
  IDocumentInfo,
  IStoreCriteria,
  IStoreCriteriaOperator,
  IStoreManager,
  IStoreProvider,
  StoreSupport
} from '../store/store-support';

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

  newStoreCriteria(name: string, value: any, operator: IStoreCriteriaOperator): IStoreCriteria {
    return new TestStoreCriteria(name, value, operator);
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
          const newId = Math.random().toString(36).substring(2, 8);
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

    searchEntities(name: string, ...criteria: TestStoreCriteria[]): Observable<T[]> {
      // No criteria defined, just send the full list
      const ret=new Array<T>();
      if( (criteria==null)||(criteria.length==0)) {
        for (const toAdd of this.getOrCreateArray(name).values()) {
          ret.push(toAdd);
        }
      } else {
        for (const toAdd of this.getOrCreateArray(name).values()) {
          let canAdd=true;
          for (const criter of criteria) {
            if (!criter.filter(toAdd)) {
              canAdd=false;
              break;
            }
          }
          if( canAdd) ret.push(toAdd);
        }

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

export class TestStoreCriteria implements IStoreCriteria {
  name: string;
  value: any;
  operator: '='|'<='|'<';

  constructor(
    name: string,
    value: any,
    operator?: IStoreCriteriaOperator
  ) {
    this.name = name;
    this.value = value;
    if (!operator) this.operator = '=';
    else {
      this.operator = operator;
    }
  }

  filter (toFilter:any): boolean {
    const testValue=toFilter[this.name];
    switch (this.operator) {
      case '=':
        return testValue == this.value;
      case '<':
        return (testValue as number)<(this.value as number);
      case '<=':
        return (testValue as number)<(this.value as number);
      default:
        return true;
    }
  }
}
