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
 * A workflow displaying the list through a carousel. It automatically selects the first element to display.
 * Editing is done inside a dialog.
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

  protected formBuilder = inject(FormBuilder);

  selectedElement = model<T | null>(null);
  protected editingEntity = signal<T | null>(null);
  protected editForm = signal<FormGroup>(this.formBuilder.group({}));
  protected canSave = signal(false);
  protected saving = signal(false);
  protected dialogVisible = signal(false);
  private subscriptions = new Subscription();

  carouselContext = computed(() => {
    const ctx = new XtBaseContext<any>('LIST_VIEW');
    ctx.setDisplayValue(this.displayableElements(), this.entityName() + '[]');
    return ctx;
  });

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.fetchFromStore();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onEditRequested(element: T): void {
    if (this.saving()) return;
    this.selectedElement.set(element);
    this.editingEntity.set(element);
    this.updateEditForm();
    this.dialogVisible.set(true);
  }

  cancelEdit(): void {
    this.editingEntity.set(null);
    this.canSave.set(false);
    this.saving.set(false);
    this.dialogVisible.set(false);
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

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

  private updateEditForm(): void {
    const entity = this.editingEntity();
    const form = this.formBuilder.group({}, {updateOn: 'change'});
    if (entity != null) {
      updateFormGroupWithValue(form, entity, this.entityName(), this.resolver.typeResolver);
    }
    this.listenToFormEvent(form);
    this.editForm.set(this.formBuilder.group({ editor: form }));
  }

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
