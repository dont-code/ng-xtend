import { DcWorkflow } from '../definition/dc-workflow';
import { Component, computed, effect, inject, input } from '@angular/core';
import { DcWorkflowModel, DcWorkflowSortOption } from '../models/dc-workflow-model';
import { XtCompositeComponent, XtResolverService } from 'xt-components';
import {
  XtSignalStore,
  XtSortBy,
  XtSortByDirection,
  XtStoreEntityFeatureOptions,
  XtStoreManagerService
} from 'xt-store';
import { ManagedData } from 'xt-type';

/**
 * A workflow base class based on the xt-store signalStore
 */
@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class AbstractDcWorkflow<T extends ManagedData=ManagedData> extends XtCompositeComponent<T> implements DcWorkflow {
  /**
   * The workflow config must be provided
   * @protected
   */
  config=input.required<DcWorkflowModel>();

  protected readonly resolver = inject (XtResolverService);
  protected readonly storeMgr = inject(XtStoreManagerService);

  protected store : XtSignalStore<T> | null | undefined = undefined;

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

  protected findStore (): XtSignalStore<T> | null {
    if (this.store===undefined) {
      const config = this.config();
      const storeOptions = this.generateStoreOptions(config);
      this.store=this.storeMgr.getStoreFor(config.entity, this.resolver.typeResolver, storeOptions);
    }
    return (this.store==null)?null:this.store;
  }

  protected safeFindStore (): XtSignalStore<T> {
    const ret= this.findStore();
    if( ret == null) throw new Error ("No store found for entity named "+this.config().entity);
    return ret;
  }

  /**
   * Returns the element that should be selected given the config and the store content
   * @protected
   */
  protected displayableElements = computed(() => {
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
   * Returns the element that should be selected given the config and the store content
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

  protected generateStoreOptions (config: DcWorkflowModel): XtStoreEntityFeatureOptions<T> | undefined {
    const options = {sort:[]} as XtStoreEntityFeatureOptions<T>;
    if( config.data?.sort!=null) {
     for (const sortKey in config.data.sort) {
       options.sort?.push(this.toSortOption(sortKey, config.data.sort[sortKey]));
     }
   }

    return (options.sort!.length>0)?options:undefined;
  }

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
