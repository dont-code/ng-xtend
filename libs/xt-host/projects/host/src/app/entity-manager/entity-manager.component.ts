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
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PrimeIcons } from 'primeng/api';

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
  saveIcon = signal( PrimeIcons.SAVE);
  deleteIcon = signal(PrimeIcons.TRASH);
  newIcon = signal(PrimeIcons.PLUS);

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
      this.store.fetchEntities().catch((error) => {
        this.errorHandler.errorOccurred(error, "Error loading entities "+entityName);
      });//.then(() => {console.debug('Yes')}).finally(() => {console.debug('Finish')});
    } else {
      this.store = null;
    }
  }

  outputChanged(newValue: XtComponentOutput | null) {
    if (newValue?.valueSelected!=null) {
      newValue?.valueSelected.subscribe (selected => {
        this.selectedEntity.set(selected);
      });
    }
  }

  async save() {
    const toSave = this.editForm().value.editor as ManagedData;
    if (toSave==null) {
      throw new Error ("Trying to save an entity that is not bind to form");
    }

    try {
      this.saveIcon.set(PrimeIcons.SPINNER);
      const savedValue = await this.safeStore().storeEntity (toSave);
      this.selectedEntity.set(savedValue);
      this.canSave.set(false);
      this.viewMode.set("list");
    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error saving entity with id "+ toSave._id);
    } finally {
      this.saveIcon.set(PrimeIcons.SAVE);
    }
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
      try {
        this.deleteIcon.set(PrimeIcons.SPINNER);
        deleted = await this.safeStore().deleteEntity (toTrash._id);
      } catch (error) {
        this.errorHandler.errorOccurred(error, "Deleting entity with id "+toTrash._id);
      } finally {
        this.deleteIcon.set(PrimeIcons.TRASH);
      }
    } else {
      deleted=true;
    }
    if (deleted) {
      this.selectedEntity.set(null);
      this.viewMode.set("list");
    }
    }

  async newEntity() {
    try {
      this.newIcon.set(PrimeIcons.SPINNER);
      const newOne = await this.safeStore().storeEntity({} as ManagedData);
      this.selectedEntity.set(newOne);
      this.viewMode.set("edit");

    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error creating and storing new Entity")
    } finally {
      this.newIcon.set(PrimeIcons.PLUS);
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
