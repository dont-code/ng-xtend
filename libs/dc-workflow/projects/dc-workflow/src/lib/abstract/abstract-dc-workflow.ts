import { DcWorkflow } from '../definition/dc-workflow';
import { Component, inject, input, InputSignal } from '@angular/core';
import { DcWorkflowModel } from '../models/dc-workflow-model';
import { XtCompositeComponent, XtResolverService } from 'xt-components';
import { XtSignalStore, XtStoreManagerService } from 'xt-store';
import { ManagedData } from 'xt-type';

/**
 * A workflow base class based on the xt-store signalStore
 */
@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class AbstractDcWorkflow<T extends ManagedData> extends XtCompositeComponent<T> implements DcWorkflow {
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
      this.store=this.storeMgr.getStoreFor(this.config().entity, this.resolver.typeResolver);
      if (this.store!=null)
        this.applyConfigToStore (this.config(), this.store);
    }
    return (this.store==null)?null:this.store;
  }

  protected safeFindStore (): XtSignalStore<T> {
    const ret= this.findStore();
    if( ret == null) throw new Error ("No store found for entity named "+this.config().entity);
    return ret;
  }

  protected applyConfigToStore (config: DcWorkflowModel, store:XtSignalStore<T>): void {

  }
}
