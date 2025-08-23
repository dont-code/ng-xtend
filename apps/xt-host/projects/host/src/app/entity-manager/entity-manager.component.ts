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
import { updateFormGroupWithValue, XtComponentOutput, XtRenderComponent, XtResolverService } from 'xt-components';
import { FormBuilder, FormGroup, PristineChangeEvent, ReactiveFormsModule } from '@angular/forms';
import { ManagedData } from 'xt-type';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Subscription } from 'rxjs';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { StoreManagerService, XtSignalStore } from 'xt-store';

@Component({
  selector: 'app-entity-manager',
  imports: [XtRenderComponent, ReactiveFormsModule, TabPanel, TabPanels, Tab, TabList, Tabs, Toolbar, Button, ProgressSpinner],
  providers: [],
  templateUrl: './entity-manager.component.html',
  styleUrl: './entity-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityManagerComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly storeMgr = inject(StoreManagerService);
  protected readonly formBuilder = inject(FormBuilder);
  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly resolver = inject (XtResolverService);

  /**
   * Support for setting entity name as an input and as a route.
   */
  entityNameInput = input<string>();

  entityName = linkedSignal( () => {
    return this.entityNameInput();
  });

  store : XtSignalStore<ManagedData> | null = null;

  editForm = signal<FormGroup>(this.formBuilder.group ({ editor: this.formBuilder.group({}) }));

  selectedEntity = signal<ManagedData|null>(null);

  canEdit= computed(()=> {
    if (this.selectedEntity()!=null)
      return true;
    return false;
  });

  viewMode = linkedSignal( () => {
    const selection = this.selectedEntity();
    if (selection!=null) {
      return "edit";
    }else return "list";
  });

  canSave=signal (false);

  saving = signal (false);
  newing = signal (false);
  deleting = signal (false);
  updating = signal (false);

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
      try {
        this.updating.set(true);
        this.store = this.storeMgr.getStoreFor(entityName);
        this.store.fetchEntities().catch((error) => {
          this.errorHandler.errorOccurred(error, "Error loading entities "+entityName);
        }).finally(() => {
          this.updating.set(false);
        });//.then(() => {console.debug('Yes')}).finally(() => {console.debug('Finish')});
      } catch (error) {
        this.updating.set(false);
      }
    } else {
      this.store = null;
    }
  }

  outputChanged(newValue: XtComponentOutput | null) {
    if (newValue?.valueSelected!=null) {
      newValue?.valueSelected.subscribe (selected => {
        this.selectedEntity.set(selected);
        this.updateEditForm();
      });
    }
  }

  updateEditForm () {
    const entity = this.selectedEntity();
    const form = this.formBuilder.group({}, {updateOn: 'change'});
    if (entity!=null) {
      updateFormGroupWithValue(form, entity, this.entityName(), this.resolver.typeResolver);
    }
    this.listenToFormEvent (form);
    this.editForm.set( this.formBuilder.group ({ editor: form }));
  }

  async save() {
    const toSave = this.editForm().value.editor as ManagedData;
    if (toSave==null) {
      throw new Error ("Trying to save an entity that is not bind to form");
    }

    try {
      this.saving.set(true);
      const savedValue = await this.safeStore().storeEntity (toSave);
      this.selectedEntity.set(savedValue);
      this.updateEditForm();
      this.canSave.set(false);
      this.viewMode.set("list");
    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error saving entity with id "+ toSave._id);
    } finally {
      this.saving.set(false);
    }
  }

  private listenToFormEvent(form: FormGroup) {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
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
      try {
        this.deleting.set(true);
        deleted = await this.safeStore().deleteEntity (toTrash._id);
      } catch (error) {
        this.errorHandler.errorOccurred(error, "Deleting entity with id "+toTrash._id);
      } finally {
        this.deleting.set(false);
      }
    } else {
      deleted=true;
    }
    if (deleted) {
      this.selectedEntity.set(null);
      this.viewMode.set("list");
      this.updateEditForm();
    }
    }

  async newEntity() {
    try {
      this.newing.set(true);
      const newOne = await this.safeStore().storeEntity({} as ManagedData);
      this.selectedEntity.set(newOne);
      this.updateEditForm();
      this.viewMode.set("edit");

    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error creating and storing new Entity")
    } finally {
      this.newing.set(false);
    }
  }

  protected safeStore(): XtSignalStore<ManagedData> {
    if (this.store!=null) {
      return this.store;
    }else {
      throw new Error ("Not store available");
    }
  }

  canReload = computed(() => {
    if (this.store!=null) {
      return ! this.store.loading();
    }else {
      return false;
    }

  })

  reloadList() {
    this.updateStore();
  }

}
