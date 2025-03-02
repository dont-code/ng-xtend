import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StoreManagerService } from '../store/store-manager.service';
import { updateFormGroupWithValue, XtComponentOutput, XtRenderComponent } from 'xt-components';
import { FormBuilder, FormGroup, PristineChangeEvent, ReactiveFormsModule } from '@angular/forms';
import { ManagedData } from 'xt-type';
import { XtSignalStore } from '../store/store-entity-feature/store-entity-feature';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-entity-manager',
  imports: [XtRenderComponent, ReactiveFormsModule, TabPanel, TabPanels, Tab, TabList, Tabs, Toolbar, Button],
  providers: [],
  templateUrl: './entity-manager.component.html',
  styleUrl: './entity-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityManagerComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly storeMgr = inject(StoreManagerService);
  protected readonly formBuilder = inject(FormBuilder);

  /**
   * Support for setting entity name as an input and as a route.
   */
  entityNameInput = input<string>();

  entityName = linkedSignal( () => {
    return this.entityNameInput();
  });

  store : XtSignalStore<ManagedData> | null = null;

  editForm = computed( () => {
    const entity = this.selectedEntity();
    const form = this.formBuilder.group({});
    if (entity!=null) {
      updateFormGroupWithValue(form, entity);
    }
    this.listenToFormEvent (form);
    return this.formBuilder.group ({ editor: form });
  });
  private subscriptions=new Subscription();

  constructor() {
    this.updateStore();
    this.route.paramMap.pipe(
      takeUntilDestroyed(),
    ).subscribe(params => {
      this.entityName.set(params.get("entityName")??undefined);
      this.updateStore();
    })

  }

  updateStore () {
    const entityName = this.entityName();
    if (entityName!=null) {
      this.store = this.storeMgr.getStoreFor(entityName);
      this.store.fetchEntities();//.then(() => {console.debug('Yes')}).finally(() => {console.debug('Finish')});
    } else {
      this.store = null;
    }
  }

  selectedEntity = linkedSignal(() => {
    const outputs=this.listOutputs();
    return outputs?.valueSelected?outputs.valueSelected() as ManagedData:null;
  });

  listOutputs = signal<XtComponentOutput|null>(null);

  selectionChanged(newValue: XtComponentOutput | null) {
    this.listOutputs.set(newValue);
  }

  canSave=signal (false);

  async save() {
    const toSave = this.editForm().value.editor as ManagedData;
    if (toSave==null) {
      throw new Error ("Trying to save an entity that is not bind to form");
    }

    const savedValue = await this.safeStore().storeEntity (toSave);
    this.selectedEntity.set(savedValue);
    this.canSave.set(false);
  }

  private listenToFormEvent(form: FormGroup) {
    this.subscriptions.add(form.events.subscribe(event => {
      const pristine = (event as PristineChangeEvent).pristine??true;
      if (!pristine) {
        this.canSave.set(true);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async deleteSelected() {
    const toTrash = this.selectedEntity();
    if (toTrash==null) {
      throw new Error ("Select an entity before clicking on delete");
    }
    let deleted=false;
    if (toTrash._id!=null) {
      deleted = await this.safeStore().deleteEntity (toTrash._id);
    } else {
      deleted=true;
    }
    if (deleted) {
      this.selectedEntity.set(null);
    }
  }

  newEntity() {

  }

  protected safeStore(): XtSignalStore<ManagedData> {
    if (this.store!=null) {
      return this.store;
    }else {
      throw new Error ("Not store available");
    }
  }
}
