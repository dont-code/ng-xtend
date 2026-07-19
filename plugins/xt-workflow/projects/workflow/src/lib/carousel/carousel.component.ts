import { Component, computed, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractDcWorkflow } from 'dc-workflow';
import { XtBaseContext, XtMessageHandler, XtRenderComponent, updateFormGroupWithValue } from 'xt-components';
import { ManagedData } from 'xt-type';
import { CarouselObjectSetComponent } from 'xt-plugin-default';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, PristineChangeEvent } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Carousel workflow component.
 * Displays entities in a card carousel with edit capability via dialog.
 * Extends AbstractDcWorkflow for store management and entity operations.
 *
 * Features:
 * - Card-based navigation through entities
 * - Edit selected entity in a modal dialog
 * - Delete entity from edit dialog
 * - Loading and empty state handling
 *
 * @typeParam T - The managed data type extending ManagedData
 */
@Component({
  selector: 'wfw-carousel',
  imports: [
    CarouselObjectSetComponent,
    ProgressSpinner, XtRenderComponent,
    ReactiveFormsModule, Button, Dialog
  ],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent <T extends ManagedData> extends AbstractDcWorkflow<T> implements OnInit, OnDestroy {

  /** Form builder for creating edit forms */
  protected formBuilder = inject(FormBuilder);

  /** Currently selected entity in the carousel (two-way bindable) */
  selectedElement = model<T | null>(null);
  /** Entity being edited in the dialog */
  protected editingEntity = signal<T | null>(null);
  /** Reactive form for editing entity data */
  protected editForm = signal<FormGroup>(this.formBuilder.group({}));
  /** Whether the form has unsaved changes */
  protected canSave = signal(false);
  /** Whether a save operation is in progress */
  protected saving = signal(false);
  /** Whether a delete operation is in progress */
  protected deleting = signal(false);
  /** Whether the edit dialog is visible */
  protected dialogVisible = signal(false);
  /** Subscriptions for form event listeners */
  private subscriptions = new Subscription();

  /**
   * Context for the carousel object set component.
   * Provides entity data and entity name to the carousel UI.
   */
  carouselContext = computed(() => {
    const ctx = new XtBaseContext<any>('LIST_VIEW');
    ctx.setDisplayValue(this.displayableElements(), this.entityName() + '[]');
    return ctx;
  });

  constructor() {
    super();
  }

  /** Initializes the component and fetches initial data from the store */
  override ngOnInit() {
    super.ngOnInit();
    this.fetchFromStore();
  }

  /** Cleans up subscriptions on component destroy */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Handles edit request from the carousel.
   * Sets the selected entity and opens the edit dialog.
   * @param element - The entity to edit
   */
  onEditRequested(element: T): void {
    if (this.saving()) return;
    this.selectedElement.set(element);
    this.editingEntity.set(element);
    this.updateEditForm();
    this.dialogVisible.set(true);
  }

  /**
   * Cancels the current edit operation.
   * Resets form state and closes the dialog.
   */
  cancelEdit(): void {
    this.editingEntity.set(null);
    this.canSave.set(false);
    this.saving.set(false);
    this.dialogVisible.set(false);
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  /**
   * Saves the edited entity to the store.
   * Updates the selected element and refreshes the entity list.
   */
  async saveEdit(): Promise<void> {
    const toSave = this.editForm().value?.editor as T;
    if (toSave == null) {
      throw new Error("Trying to save an entity that is not bound to form");
    }
    try {
      this.saving.set(true);
      const savedValue = await this.safeFindStore().storeEntity(toSave);
      this.cancelEdit();
      this.selectedElement.set(savedValue);
      await this.fetchFromStore();
    } catch (error) {
      this.errorHandler.errorOccurred(error, "Error saving entity with id " + (toSave as any)._id);
      this.saving.set(false);
    }
  }

  /**
   * Deletes the currently editing entity from the store.
   * Clears selection and closes the dialog on success.
   */
  async deleteEntity(): Promise<void> {
    const toTrash = this.editingEntity();
    if (toTrash == null) return;
    if (toTrash._id != null) {
      try {
        this.deleting.set(true);
        const deleted = await this.safeFindStore().deleteEntity(toTrash._id);
        if (deleted) {
          this.cancelEdit();
          this.selectedElement.set(null);
        }
      } catch (error) {
        this.errorHandler.errorOccurred(error, "Deleting entity with id " + toTrash._id);
        this.deleting.set(false);
      } finally {
        this.deleting.set(false);
      }
    } else {
      this.cancelEdit();
      this.selectedElement.set(null);
    }
  }

  /**
   * Creates a reactive form populated with the editing entity's values.
   * Sets up form event listeners to track pristine state.
   */
  private updateEditForm(): void {
    const entity = this.editingEntity();
    const form = this.formBuilder.group({}, {updateOn: 'change'});
    if (entity != null) {
      updateFormGroupWithValue(form, entity, this.entityName(), this.resolver.typeResolver);
    }
    this.listenToFormEvent(form);
    this.editForm.set(this.formBuilder.group({ editor: form }));
  }

  /**
   * Subscribes to form events to detect when the form becomes dirty.
   * Enables the save button when the user makes changes.
   */
  private listenToFormEvent(form: FormGroup): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.subscriptions.add(form.events.subscribe(event => {
      const pristine = (event as PristineChangeEvent).pristine ?? true;
      if (!pristine) {
        this.canSave.set(true);
      }
    }));
  }
}
