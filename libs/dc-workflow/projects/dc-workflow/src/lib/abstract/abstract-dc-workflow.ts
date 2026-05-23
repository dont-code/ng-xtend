import { DcWorkflow } from '../definition/dc-workflow';
import { Component, inject, input, InputSignal } from '@angular/core';
import { DcWorkflowModel, DcWorkflowSortModel, DcWorkflowSortOption } from '../models/dc-workflow-model';
import { XtCompositeComponent, XtResolverService } from 'xt-components';
import { XtSignalStore, XtSortBy, XtSortByDirection, XtStoreEntityFeatureOptions, XtStoreManagerService } from 'xt-store';
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
      ret.direction=(sort==="ascending")?XtSortByDirection.Ascending:XtSortByDirection.None;
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
