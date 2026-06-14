import { AbstractXtStoreProvider } from './xt-store-provider';
import { from, Observable, of, Subject, throwError } from 'rxjs';
import { UploadedDocumentInfo } from '../xt-document';
import { ManagedData } from 'xt-type';

/**
 * In-memory store provider for testing or ephemeral data storage.
 * Data is not persisted beyond the application lifecycle.
 */
export class XtMemoryStoreProvider<T extends ManagedData> extends AbstractXtStoreProvider<T> {
  /** Internal map of entity name to map of key-to-entity. */
  protected storage=new Map<string, Map<string, T>>();

  /**
   * It supports storing documents in memory only, then use with care !
   */
  override canStoreDocument(): boolean {
    return true;
  }

  /**
   * Returns or creates the internal map for the given entity name.
   * @param name - The entity name
   * @returns A map of keys to entities
   */
  getSafeStore (name:string):Map<string,T> {
    let ret = this.storage.get(name);
    if (ret==null) {
      ret = new Map<string, T>();
      this.storage.set(name, ret);
    }
    return ret;
  }

  /**
   * Deletes an entity from the in-memory store.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to true if the entity existed
   */
  deleteEntity(name: string, key: any): Promise<boolean> {
    const store = this.getSafeStore (name);
    return Promise.resolve(store.delete(key));
  }

  /**
   * Loads an entity from the in-memory store.
   * @param name - The entity name
   * @param key - The entity identifier
   * @returns A promise resolving to the entity or undefined
   */
  loadEntity(name: string, key: any): Promise<T | undefined> {
    const store = this.getSafeStore (name);
    return Promise.resolve(store.get(key));
  }

  /**
   * Lists all entities of a given type from the in-memory store.
   * @param name - The entity name
   * @returns An observable emitting the array of entities
   */
  override listEntities(name: string): Observable<T[]> {
    const store = this.getSafeStore (name);
    //console.debug("Listing entities for "+name+" with ",store);
    return of (Array.from(store.values()));
  }

  /**
   * Stores (creates or updates) an entity in memory. Auto-generates an _id if missing.
   * @param name - The entity name
   * @param entity - The entity data to store
   * @returns A promise resolving to the stored entity
   */
  storeEntity(name: string, entity: T): Promise<T> {
    const store = this.getSafeStore (name);
    if (entity._id==null) {
      entity._id = Math
        .random().toString(36).substring(2, 8);
    }
    store.set(entity._id, entity);
    return Promise.resolve(entity);
  }

  /**
   * "Uploads" documents to in-memory blob URLs (ephemeral, for testing only).
   * @param toStore - The files to process
   * @returns An observable emitting document info with blob URLs
   */
  override storeDocuments(toStore: File[]): Observable<UploadedDocumentInfo> {
    const toSend = new Array<UploadedDocumentInfo>();
    for (const file of toStore) {
      const ret: UploadedDocumentInfo = { documentName:file.name, documentId: URL.createObjectURL(file), isUrl: true };
      toSend.push(ret);
    }
    return from(toSend)
  }

}
