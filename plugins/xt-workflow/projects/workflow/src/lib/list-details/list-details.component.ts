import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  model,
  OnDestroy,
  OnInit,
  signal, viewChild
} from '@angular/core';
import { updateFormGroupWithValue, XtBaseModel, XtMessageHandler, XtRenderComponent } from 'xt-components';
import { FormBuilder, FormGroup, PristineChangeEvent, ReactiveFormsModule } from '@angular/forms';
import { ManagedData } from 'xt-type';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Subscription } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AbstractDcWorkflow } from 'dc-workflow';

/**
 * List-details workflow component.
 * Displays entities in a tabbed interface with List and Edit views.
 * Extends AbstractDcWorkflow for store management and entity operations.
 *
 * Features:
 * - Tabbed list/edit view with automatic view switching
 * - Inline editing in the Edit tab
 * - Create, save, delete, and reload operations via toolbar
 * - Live preview of edits in the list view
 *
 * @typeParam T - The managed data type extending ManagedData
 */
@Component({
  selector: 'wfw-list-details',
  imports: [XtRenderComponent, ReactiveFormsModule, TabPanel, TabPanels, Tab, TabList, Tabs, Toolbar, Button, ProgressSpinner],
  providers: [],
  templateUrl: './list-details.component.html',
  styleUrl: './list-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailsComponent<T extends ManagedData> extends AbstractDcWorkflow<T> implements OnInit, OnDestroy {
  /** Form builder for creating edit forms */
  protected readonly formBuilder = inject(FormBuilder);

  /** Reactive form for editing the selected entity */
  editForm = signal<FormGroup>(this.formBuilder.group ({ editor: this.formBuilder.group({}) }));

  /** Whether an entity is selected and can be edited */
  canEdit= computed(()=> {
    if (this.selectedEntity()!=null)
      return true;
    return false;
  });

  /**
   * Linked signal tracking the current view mode ('list' or 'edit').
   * Automatically switches to 'edit' when an entity is selected.
   */
  viewMode = linkedSignal( () => {
    const selection = this.selectedEntity();
    if (selection!=null) {
      return "edit";
    }else return "list";
  });

    /** Reference to the Tabs component for detecting user-initiated tab changes */
  tabs = viewChild (Tabs);

  /**
   * Effect that syncs the viewMode with user-initiated tab changes.
   * Prevents the linkedSignal from overriding manual tab selection.
   */
  tabChanged= effect(() => {
    const tabs = this.tabs();
    if( tabs!=null) {
      const tabValue = tabs.value();
      this.viewMode.set(tabValue as 'list'|'edit');
    }
});

  /** Current form value for live preview in list view */
  formValue = signal<any>(null);

  /**
   * Computed signal returning entities with the currently edited values overlaid.
   * Provides live preview of edits in the list view without requiring save.
   */
  displayedEntities = computed<T[]>(() => {
    const entities = this.displayableElements();
    const value = this.formValue();
    const selected = this.selectedEntity();
    if (value != null && selected != null && (selected as any)._id != null) {
      const selectedId = (selected as any)._id;
      return entities.map(e =>
        (e as any)._id === selectedId
          ? { ...(e as any), ...(value as any) }
          : e
      ) as T[];
    }
    return entities;
  });

  /** Whether the form has unsaved changes */
  canSave=signal (false);

  /** Whether a save operation is in progress */
  saving = signal (false);
  /** Whether a create operation is in progress */
  newing = signal (false);
  /** Whether a delete operation is in progress */
  deleting = signal (false);

  /** The currently selected entity for editing */
  selectedEntity= model<any>();

  /** Base model for the list view */
  listModel =new XtBaseModel<any>();

  /**
   * Effect that updates the edit form whenever the selected entity changes.
   */
  selectedEntityChanged= effect( ()=> {
    const selected=this.selectedEntity();
    this.updateEditForm();
  });

  /**
   * Effect that re-fetches entities when the workflow config changes.
   */
  workflowConfigChanged= effect (() => {
    const newConfig=this.config();
    this.fetchFromStore();
  });

  /** Subscriptions for form event listeners */
  private subscriptions=new Subscription();

  constructor() {
    super();
    this.listModel.valueSelected=this.selectedEntity;
  }

  /** Initializes the component and fetches initial data from the store */
  override ngOnInit () {
    super.ngOnInit();
    this.fetchFromStore();
  }


  /**
   * Updates the edit form based on the selected entity.
   * Creates a new form group populated with entity values and sets up event listeners.
   */
  updateEditForm () {
    const entity = this.selectedEntity();
    const form = this.formBuilder.group({}, {updateOn: 'change'});
    if (entity!=null) {
      updateFormGroupWithValue(form, entity, this.entityName(), this.resolver.typeResolver);
      this.formValue.set(form.value);
    } else {
      this.formValue.set(null);
    }
    this.listenToFormEvent (form);
    this.editForm.set( this.formBuilder.group ({ editor: form }));
  }

  /**
   * Saves the current edit form to the store.
   * Updates the selected entity and switches back to list view.
   */
  async save() {
    const toSave = this.editForm().value.editor as T;
    if (toSave==null) {
      throw new Error ("Trying to save an entity that is not bind to form");
    }

    try {
      this.saving.set(true);
      const savedValue = await this.safeFindStore().storeEntity (toSave);
      this.selectedEntity.set(savedValue);
      this.canSave.set(false);
      this.viewMode.set("list");
    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error saving entity with id "+ toSave._id);
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Subscribes to form events to track value changes and pristine state.
   * Updates formValue for live list preview and enables save when form is dirty.
   */
  private listenToFormEvent(form: FormGroup) {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.subscriptions.add(form.valueChanges.subscribe(value => {
      this.formValue.set(value);
    }));
    this.subscriptions.add(form.events.subscribe(event => {
      const pristine = (event as PristineChangeEvent).pristine??true;
      if (!pristine) {
        this.canSave.set(true);
      }
    }));
  }

  /** Cleans up subscriptions on component destroy */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Deletes the currently selected entity from the store.
   * Clears selection and returns to list view on success.
   */
  async deleteSelected() {
    const toTrash = this.selectedEntity();
    if (toTrash==null) {
      throw new Error ("Select an entity before clicking on delete");
    }
    let deleted=false;
    if (toTrash._id!=null) {
      try {
        this.deleting.set(true);
        deleted = await this.safeFindStore().deleteEntity (toTrash._id);
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
    }
    }

  /**
   * Creates a new empty entity in the store.
   * Selects the new entity and switches to edit view.
   */
  async newEntity() {
    try {
      this.newing.set(true);
      const newOne = await this.safeFindStore().storeEntity({} as T);
      this.selectedEntity.set(newOne);
      this.viewMode.set("edit");

    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error creating and storing new Entity")
    } finally {
      this.newing.set(false);
    }
  }

  /**
   * Whether the reload button should be enabled.
   * True when the store exists and is not currently loading.
   */
  canReload = computed(() => {
    if (this.store!=null) {
      return ! this.store.loading();
    }else {
      return false;
    }

  })

  /**
   * Reloads the entity list from the store.
   */
  reloadList() {
    this.fetchFromStore();
  }

}
