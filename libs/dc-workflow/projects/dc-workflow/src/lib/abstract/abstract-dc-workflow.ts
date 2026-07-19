import { DcWorkflow } from '../definition/dc-workflow';
import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { DcWorkflowModel, DcWorkflowSortOption } from '../models/dc-workflow-model';
import { XtCompositeComponent, XtMessageHandler, XtResolverService } from 'xt-components';
import {
  XtSignalStore,
  XtSortBy,
  XtSortByDirection,
  XtStoreEntityFeatureOptions,
  XtStoreManagerService
} from 'xt-store';
import { ManagedData } from 'xt-type';
import { FormGroup } from '@angular/forms';

/**
 * Abstract base class for all dc-workflow implementations.
 * Provides store management, entity fetching, display filtering, and selection logic.
 *
 * Concrete implementations (CarouselComponent, ListDetailsComponent) extend this class
 * and add their own UI and interaction patterns.
 *
 * @typeParam T - The managed data type extending ManagedData
 */
@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class AbstractDcWorkflow<T extends ManagedData=ManagedData> extends XtCompositeComponent<T> implements DcWorkflow {
  /**
   * Required workflow configuration input signal.
   * Controls entity type, workflow behavior, sorting, display, and selection.
   */
  config=input.required<DcWorkflowModel>();

  /** Resolver service for type information and component resolution */
  protected readonly resolver = inject (XtResolverService);
  /** Store manager for creating and retrieving entity stores */
  protected readonly storeMgr = inject(XtStoreManagerService);
  /** Error handler for displaying user-facing error messages */
  protected readonly errorHandler = inject(XtMessageHandler);


  /**
   * The signal store managing entity data access.
   * States: undefined (not initialized), null (no entity), XtSignalStore (active)
   * @protected
   */
  protected store : XtSignalStore<T> | null | undefined = undefined;

  /** True while the store is performing an async operation (fetching, saving, etc.) */
  updating = signal (false);

  /** Shortcut signal providing the current entity name from config */
  entityName = linkedSignal( () => {
    return this.config().entity;
  });

  /**
   * Toggle signal that changes whenever a new store is created.
   * Used to force recomputation of derived signals (e.g., displayableElements).
   * @protected
   */
  protected storeChanged=signal<boolean>(false);

  /**
   * Effect that reacts to config changes.
   * If the entity hasn't changed, updates store options (sort/filter).
   * If the entity changed, resets the store to trigger recreation on next access.
   * @protected
   */
  protected configUpdated = effect( async ()=> {
    const config = this.config();
    const curStore = this.store;
    if (curStore===undefined) return; // No curStore needed yet, config changes have no effects
    if (curStore!==null) {
      if (config.entity==curStore.entityName()) // Entity didn't change
      {
          // Let's just update the options
        await curStore.updateStoreOptions(this.generateStoreOptions(config));
      } else {
        this.store = undefined; // Then next call to findStore will recreate a new store for the new entity
      }
    } else {
      this.store=undefined; // Force a recalculation of the store
    }
  });

  /**
   * Finds or creates the store for the current entity configuration.
   * @returns The store instance, or null if no entity is configured
   * @protected
   */
  protected findStore (): XtSignalStore<T> | null {
    if (this.store===undefined) {
      const config = this.config();
      const storeOptions = this.generateStoreOptions(config);
      this.store=this.storeMgr.getStoreFor(config.entity, this.resolver.typeResolver, storeOptions);
    }
    return (this.store==null)?null:this.store;
  }

  /**
   * Finds the store and throws if not found.
   * @throws Error if no store exists for the configured entity
   * @protected
   */
  protected safeFindStore (): XtSignalStore<T> {
    const ret= this.findStore();
    if( ret == null) throw new Error ("No store found for entity named "+this.config().entity);
    return ret;
  }

  /**
   * Computed signal returning entities filtered by display configuration.
   * Applies 'current-and-after' filters to hide entities with past dates.
   * Recalculates when the store changes (via storeChanged signal).
   * @protected
   */
  protected displayableElements = computed(() => {
    const enforceStoreChange = this.storeChanged(); // Recalculate in case the store has changed
    const config = this.config();
    const entities = this.safeFindStore().entities();
    const selectConfig = config.display;
    if ((selectConfig?.fields==null) || (Object.keys(selectConfig?.fields).length==0)) {
      return entities;
    }
    const currentDate=new Date();
    return entities.filter((val)=>  {
      for (const key in selectConfig.fields) {
        const value=val[key as keyof T];
        if( selectConfig.fields[key]==='current-and-after') {
          if ((value==null) || ((value as Date) < currentDate)) {
            return false;
          }
        }
      }
      return true;
    });
  });

  /**
   * Fetches entities from the store.
   * Handles entity changes by recreating the store when needed.
   * Sets updating signal during the async operation.
   */
  protected fetchFromStore () {
    const entityName = this.entityName();
    if (entityName!=null) {
      try {
        this.updating.set(true);
        // If the entity is different, then we must change the whole store
        if (this.store?.entityName()!=entityName) {
          this.store = this.safeFindStore();
          this.storeChanged.update((oldVal)=> !oldVal); // Force update whenever the store changed
        }
        this.store.fetchEntities().catch((error) => {
          this.errorHandler.errorOccurred(error, "Error loading entities "+entityName);
        }).finally(() => {
          this.updating.set(false);
        });
      } catch (error) {
        this.updating.set(false);
      }
    } else {
      this.store = null;
    }
  }

  /**
   * Computed signal that determines which entity should be pre-selected based on config.
   * Supports 'closest-after' and 'closest-before' selection relative to current date.
   * Optimizes by checking if the data is already sorted.
   * @protected
   */
  protected selectedElementThroughConfig = computed(() =>{
    const config = this.config();
    const selectConfig = config.selection;
    const fieldKey=selectConfig?.field?.key;
    if (fieldKey!=null) {
      const elements = this.safeFindStore().entities();
      let toCheck=[...elements];
        // We can optimize the selection if the list is already sorted
      const sortModel=(config.data?.sort!=null)?config.data?.sort![fieldKey]:null;
      let isWellSorted:boolean|undefined=(sortModel=='ascending')? true:(sortModel=='descending')?false: sortModel?.direction=='ascending';
      if( isWellSorted===false) {
        toCheck=toCheck.reverse();
        isWellSorted=true;
      }
      // Find the first element that matches the criteria
      if(selectConfig!.field!.type=='closest-after' || selectConfig?.field?.type=='closest-before') {
        let closestBefore: T|null=null;
        let closestAfter:T|null=null;
        let currentDate = new Date();

        for (const elem of toCheck) {
          if ((elem[fieldKey] !=null)&& ((typeof elem[fieldKey]!=='object') || ( elem[fieldKey] instanceof Date))) {
            if( elem[fieldKey] > currentDate ) {
                // We found an element after the current date
              if( isWellSorted) {
                  // The list is already sorted, so we can return immediately.
                if (selectConfig!.field!.type=='closest-before') return closestBefore;
                else return elem;
              } else if (closestAfter==null) {
                closestAfter=elem;
              } else {
                closestAfter=((closestAfter[fieldKey]! as Date) < elem[fieldKey])?closestAfter:elem;
              }
            } else if (closestBefore==null) {
              closestBefore=elem;
            } else {
              closestBefore=((closestBefore[fieldKey]! as Date) > elem[fieldKey])?closestBefore:elem;
            }
          }
        }

        return (selectConfig!.field!.type=='closest-before')?closestBefore:closestAfter;
      }
    }
    return null;
  });

  /**
   * Generates store entity options from workflow config.
   * Converts DcWorkflowSortModel to XtStoreEntityFeatureOptions.
   * @protected
   */
  protected generateStoreOptions (config: DcWorkflowModel): XtStoreEntityFeatureOptions<T> | undefined {
    const options = {sort:[]} as XtStoreEntityFeatureOptions<T>;
    if( config.data?.sort!=null) {
     for (const sortKey in config.data.sort) {
       options.sort?.push(this.toSortOption(sortKey, config.data.sort[sortKey]));
     }
   }

    return (options.sort!.length>0)?options:undefined;
  }

  /**
   * Converts a DcWorkflowSortOption to an XtSortBy configuration.
   * @throws Error for metadata sort type (not yet supported)
   * @protected
   */
  protected toSortOption (name:string, sort:DcWorkflowSortOption): XtSortBy<T> {
    const ret = { by:name } as XtSortBy<T>;

    if (sort==="ascending" || sort==="descending" ) {
      ret.direction=(sort==="ascending")?XtSortByDirection.Ascending:XtSortByDirection.Descending;
    } else if (sort==null){
      ret.direction=XtSortByDirection.None;
    } else if (sort.type=='metadata') {
      throw new Error ("Metadata sort is not supported yet for element "+name);
    } else {
      ret.direction=(sort.direction==="ascending")?XtSortByDirection.Ascending:XtSortByDirection.Descending;
    }
    return ret;
  }
}
