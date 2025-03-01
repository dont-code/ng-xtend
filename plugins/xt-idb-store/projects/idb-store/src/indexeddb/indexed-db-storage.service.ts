/**
 * Allow storing of entities in the browser local database
 */
import { from, Observable, Subscription } from 'rxjs';
import Dexie, { Table } from 'dexie';
import { Injectable, OnDestroy } from '@angular/core';
import { AbstractXtStoreProvider, UploadedDocumentInfo, XtStoreCriteria, XtStoreProviderHelper } from 'xt-store';


@Injectable({
  providedIn: 'root'
})
export class IndexedDbStorageService<T=never> extends AbstractXtStoreProvider<T> implements OnDestroy {

  protected static globalDb: Dexie|null;

  protected db: Dexie|null=null;

  protected dbName = "Dont-code Sandbox Lib";

  protected subscriptions = new Subscription ();

  /**
   * Enable test code to close a database between tests
   */
  public static forceCloseDatabase () {
    // eslint-disable-next-line no-restricted-syntax
    //console.debug("IndexedDB: In forceCloseDatabase");
    if (this.globalDb!=null) {
      // eslint-disable-next-line no-restricted-syntax
      //console.debug("IndexedDB: GlobalDB Exist");
      if (this.globalDb.isOpen()) {
        // eslint-disable-next-line no-restricted-syntax
        //console.debug("IndexedDB: Closing GlobalDB");
        this.globalDb.close();
        // eslint-disable-next-line no-restricted-syntax
        //console.debug("IndexedDB: GlobalDB is closed");
      }
    }
  }

  public static forceDeleteDatabase (dbName:string):Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    //console.debug("IndexedDB: In forceDeleteDatabase");
    return Dexie.delete(dbName).then(() => {
      // eslint-disable-next-line no-restricted-syntax
      //console.debug("IndexedDB: Database "+dbName+" deleted");
    });
  }

  constructor(/*protected values: ValueService,
    protected configService: CommonConfigService,
    @Optional () modelMgr?:DontCodeModelManager*/
  ) {
    super(/*modelMgr*/);
    /*this.updateConfig (configService.getConfig());
    this.subscriptions.add (configService.getUpdates().pipe (map ((newConfig) => {
      this.updateConfig(newConfig);
    })).subscribe());*/
      // Let unit tests close or delete the database between tests if needed
    if ((self as any)._indexedDbStorageServiceForceClose == null) {
      (self as any)._indexedDbStorageServiceForceClose = () => IndexedDbStorageService.forceCloseDatabase();
    }
    if ((self as any)._indexedDbStorageServiceForceDelete == null) {
      (self as any)._indexedDbStorageServiceForceDelete = (dbName:string) => IndexedDbStorageService.forceDeleteDatabase(dbName);
    }

}

  deleteEntity(name: string, key: any): Promise<boolean> {
    return this.ensurePositionCanBeStored(name, false).then(table => {
      return table.delete(key).then(() => {
        return true;
      });
    });

  }

  loadEntity(name: string, key: any): Promise<T|undefined> {
    return this.ensurePositionCanBeStored(name, false).then (table => {
      return table.get(key);
    }).catch(reason =>  {
      console.warn("IndexedDB: Cannot load entity "+key+" : "+reason);
      return undefined;
    });
  }

  override searchEntities(name: string, ...criteria: XtStoreCriteria[]): Observable<Array<T>> {
    return from (
      this.ensurePositionCanBeStored(name, false).then(table => {
      return table.toArray().then(list => {
        return XtStoreProviderHelper.applyFilters(list, ...criteria);
      });
    }).catch(reason => {
      // Probably table not found, just returns empty values
        console.warn("IndexedDB: Cannot search entity: "+reason);
        return [];
      })
    );
  }

  canStoreDocument(): boolean {
    return false;
  }
  storeDocuments(toStore: File[]): Observable<UploadedDocumentInfo> {
    throw new Error("Impossible to store documents in IndexedDB.");
  }

  storeEntity(name: string, entity: any): Promise<T> {
    return this.ensurePositionCanBeStored(name, true).then(table => {
      return table.put(entity).then(key => {
        if ((entity._id) && (entity._id!==key)) {
          return Promise.reject("Stored entity with id "+key+" different from "+entity._id);
        } else {
          return entity;
        }

      });
    });
  }

  ensureEntityCanBeStored (description: any, create?:boolean):Promise<Table<T>> {
    if (description)
      return this.ensurePositionCanBeStored(description.name, create);
    else{
      return Promise.reject("Error called with null description");
    }
  }

  ensurePositionCanBeStored (name: string, create?:boolean):Promise<Table<T>> {
    return this.withDatabase().then (db => {
      // We have to make sure the database is open before we can get the list of tables
      let table;
      try {
        table = db.table(name);
      } catch (error) {
        // Just ignore table not found
      }
      if (table != null) return Promise.resolve(table);

      if (create) {
        const tableDescription: { [key: string]: string } = {};
        tableDescription[name] = '++_id';
        return this.changeSchema(db, tableDescription).then(db => {
          return db.table(name);
        });
      } else {
        return Promise.reject(name + ' table not found');
      }
    });
  }

  protected changeSchema(db : Dexie, schemaChanges:any): Promise<Dexie> {
    //console.log("IndexedDB: Closing DB");
    db.close();
/*    const newDb = new Dexie(db.name,{allowEmptyDB:true, autoOpen:false});

    newDb.on('blocked', ()=>false); // Silence console warning of blocked event.

    // Workaround: If DB is empty from tables, it needs to be recreated
    if (db.tables.length === 0) {
      return db.delete().then (value => {
        newDb.version(1.5).stores(schemaChanges);
        return newDb.open();
      })
    }

    // Extract current schema in dexie format:
    const currentSchema = db.tables.reduce((result:{[key:string]:any},{name, schema}) => {
      result[name] = [
        schema.primKey.src,
        ...schema.indexes.map(idx => idx.src)
      ].join(',');
      return result;
    }, {});
*/
    //console.log("Version: " + db.verno);
    //console.log("Current Schema: ", currentSchema);

    // Tell Dexie about current schema:
   // newDb.version(db.verno).stores(currentSchema);
    // Tell Dexie about next schema:
    //console.log("IndexedDB: Versioning DB to "+(db.verno + 1)+ " from tables "+this.allTables(db));
    db.version(db.verno + 1).stores(schemaChanges);
    // Upgrade it:
    //console.log("IndexedDB: Upgrading DB");
    return db.open().then (database => {
      //console.log("IndexedDB: Upgraded DB v"+database.verno+" to tables "+this.allTables(database));
      return database;
    });
  }

  /*updateConfig (newConfig:CommonLibConfig) {
    if ((newConfig.indexedDbName!=null) && (newConfig.indexedDbName.length > 0)) {
      if( newConfig.indexedDbName!=this.dbName) {
        this.dbName=newConfig.indexedDbName;
        if (this.db?.isOpen ()) {
          console.warn ("Changing the name of an Open IndexedDB database to "+newConfig.indexedDbName);
          this.db.close();
          this.db = null; // Force reopen of db next time
        }
        IndexedDbStorageService.forceCloseDatabase();
      }
    }
  }*/

  withDatabase (): Promise<Dexie> {
    if (this.db==null) {

      //console.log("IndexedDB: Checking GlobalDB "+this.dbName);
      if(IndexedDbStorageService.globalDb==null) {
        IndexedDbStorageService.globalDb = new Dexie(this.dbName, {allowEmptyDB:true, autoOpen:false});
        //console.log("IndexedDB: GlobalDB "+this.dbName+" created");
      }
      this.db=IndexedDbStorageService.globalDb;
      if( !this.db.isOpen()) {
        //console.log("IndexedDB: Opening DB "+this.dbName);
        return this.db.open().then(database => {
          //console.log ("IndexedDB: DB "+this.dbName+" v"+database.verno+" opened with tables "+this.allTables(database));
          return database;
        });
      }
    }
    return Promise.resolve(this.db);
  }

  ngOnDestroy () {
    //console.log("IndexedDB: ngOnDestroy called");
    this.subscriptions.unsubscribe();
    IndexedDbStorageService.forceCloseDatabase();
  }

  allTables (db:Dexie): string {
    let ret="";
    for (const table of db.tables) {
      ret=ret+", "+table.name;
    }
    return ret;
  }
}
