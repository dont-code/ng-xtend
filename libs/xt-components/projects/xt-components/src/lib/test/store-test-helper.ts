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
  /**
   * Sets a TestStoreManager as the test store manager in StoreSupport.
   * Call this in test setup to use the in-memory store provider.
   */
  public static ensureTestProviderOnly() {
    StoreSupport.setTestStoreManager(new TestStoreManager());
  }
}

/**
 * A test implementation of IStoreManager that always returns a single TestStoreProvider.
 * Used to emulate xt-store for unit testing purposes.
 */
export class TestStoreManager implements IStoreManager {
  /** The default provider returned for all store operations. */
  protected defaultProvider= new TestStoreProvider();

  /**
   * Returns the default test store provider.
   * @param name - Ignored; always returns the same provider
   * @returns The default TestStoreProvider
   */
  getProvider<T = never>(name?: string): IStoreProvider<T> | undefined {
    return this.defaultProvider;
  }

  /**
   * Returns the default test store provider (safe variant).
   * @param name - Ignored; always returns the same provider
   * @returns The default TestStoreProvider
   */
  getProviderSafe<T = never>(name?: string): IStoreProvider<T> {
    return this.defaultProvider;
  }

  /**
   * Returns the default test store provider.
   * @returns The default TestStoreProvider or undefined
   */
  getDefaultProvider<T = never>(): IStoreProvider<T> | undefined {
    return this.defaultProvider;
  }

  /**
   * Returns the default test store provider (safe variant).
   * @returns The default TestStoreProvider
   */
  getDefaultProviderSafe<T = never>(): IStoreProvider<T> {
    return this.defaultProvider;
  }

  /**
   * Creates a new TestStoreCriteria instance.
   * @param name - The field name for the criteria
   * @param value - The value to match
   * @param operator - The comparison operator
   * @returns A new TestStoreCriteria
   */
  newStoreCriteria<T=any>(name: keyof T, value: any, operator: IStoreCriteriaOperator): IStoreCriteria<T> {
    return new TestStoreCriteria(name, value, operator);
  }

}

/**
 * A test implementation of IStoreProvider that stores entities in an in-memory map.
 * Supports basic CRUD and filtering operations for unit testing.
 */
export class TestStoreProvider<T = never> implements IStoreProvider<T> {
    /** In-memory data store, keyed by entity type name then by entity key. */
    protected data = new Map<string, Map<string,any>> ();

    /**
     * Gets or creates a named entity map within the data store.
     * @param name - The entity type name
     * @returns The map of entities for the given type
     */
    protected getOrCreateArray (name: string): Map<string,T> {
      let ret=this.data.get(name);
      if (ret==null) {
        ret = new Map<string, T>();
        this.data.set(name, ret);
      }
      return ret;
    }

    /**
     * Extracts a unique key from a value object, using _id, id, or generating a new one.
     * @param value - The value to extract the key from
     * @param create - Whether to generate a new key if none exists
     * @returns The extracted or generated key string
     */
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

    /**
     * Stores an entity in the in-memory data store.
     * @param name - The entity type name
     * @param entity - The entity to store
     * @returns A promise resolving to the stored entity
     */
    storeEntity(name: string, entity: T): Promise<T> {
      this.getOrCreateArray(name).set(this.extractKey(entity, true), entity);
      return Promise.resolve(entity);
    }

    /**
     * Loads an entity by key, throwing if not found.
     * @param name - The entity type name
     * @param key - The entity key
     * @returns A promise resolving to the entity
     */
    safeLoadEntity(name: string, key: any): Promise<T> {
        const ret = this.getOrCreateArray(name).get(key);
        if (ret==null) {
          throw new Error ("No entity named "+name+" with key "+key);
        }
        return Promise.resolve(ret);
    }

    /**
     * Loads an entity by key, returning undefined if not found.
     * @param name - The entity type name
     * @param key - The entity key
     * @returns A promise resolving to the entity or undefined
     */
    loadEntity(name: string, key: any): Promise<T | undefined> {
      return Promise.resolve(this.getOrCreateArray(name).get(key));
    }

    /**
     * Deletes an entity by key.
     * @param name - The entity type name
     * @param key - The entity key
     * @returns A promise resolving to true if deleted, false otherwise
     */
    deleteEntity(name: string, key: any): Promise<boolean> {
        return Promise.resolve( this.getOrCreateArray(name).delete(key));
    }

    /**
     * Searches entities by optional criteria. Returns all entities if no criteria provided.
     * @param name - The entity type name
     * @param criteria - Optional filter criteria
     * @returns An observable of matching entities
     */
    searchEntities(name: string, ...criteria: IStoreCriteria<T>[]): Observable<T[]> {
      // No criteria defined, just send the full list
      const ret=new Array<T>();
      if( (criteria==null)||(criteria.length==0)) {
        for (const toAdd of this.getOrCreateArray(name).values()) {
          ret.push(toAdd);
        }
      } else {
        for (const toAdd of this.getOrCreateArray(name).values()) {
          let canAdd=true;
          for (const criter of criteria as TestStoreCriteria<T>[]) {
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

    /**
     * Search and prepare entities with sorting, grouping, and transformation (not implemented).
     */
    searchAndPrepareEntities(name: string, sort?: any, groupBy?: any, transformer?: IDataTransformer<T> | undefined, ...criteria: any[]): Observable<any> {
        throw new Error('Method not implemented.');
    }
    /**
     * Indicates that this provider supports document storage.
     * @returns True
     */
    canStoreDocument(): boolean {
        return true;
    }
    /**
     * Stores a document file and returns its document info.
     * @param toStore - The file to store
     * @returns A promise resolving to the document info
     */
    storeDocument(toStore: File): Promise<IDocumentInfo> {
      const ret = new TestDocumentInfo(toStore.name, true,URL.createObjectURL(toStore));
      return Promise.resolve(ret);
    }

    /**
     * Stores multiple document files (not implemented).
     */
    storeDocuments(toStore: File[]): Observable<IDocumentInfo> {
        throw new Error('Method not implemented.');
    }

}

/**
 * A test implementation of IDocumentInfo for testing document storage operations.
 */
export class TestDocumentInfo implements IDocumentInfo {
  /** The name of the stored document. */
  documentName: string;
  /** Whether the document is referenced by URL. */
  isUrl: boolean;
  /** Optional document identifier. */
  documentId?: string;

  /**
   * Creates a new TestDocumentInfo instance.
   * @param documentName - The document name
   * @param isUrl - Whether the document is a URL
   * @param documentId - Optional document identifier
   */
  constructor(documentName: string, isUrl: boolean,documentId?: string) {
    this.documentId = documentId;
    this.documentName = documentName;
    this.isUrl = isUrl;
  }
}

/**
 * A test implementation of IStoreCriteria that filters entities by field comparison.
 */
export class TestStoreCriteria<T=any> implements IStoreCriteria<T> {
  /** The field name to filter on. */
  name: keyof T;
  /** The value to compare against. */
  value: any;
  /** The comparison operator (=, <=, <). */
  operator: '='|'<='|'<';

  /**
   * Creates a new TestStoreCriteria instance.
   * @param name - The field name to filter on
   * @param value - The value to compare against
   * @param operator - The comparison operator (default '=')
   */
  constructor(
    name: keyof T,
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

  /**
   * Filters an entity by comparing its field value against the criteria value.
   * @param toFilter - The entity to test
   * @returns True if the entity matches the criteria
   */
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
