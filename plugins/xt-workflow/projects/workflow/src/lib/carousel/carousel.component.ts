import { Component, computed, effect, inject, linkedSignal, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractDcWorkflow } from 'dc-workflow';
import { XtMessageHandler, XtRenderComponent, updateFormGroupWithValue } from 'xt-components';
import { ManagedData } from 'xt-type';
import { Carousel } from 'primeng/carousel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, PristineChangeEvent } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * A workflow displaying the list through a carousel. It automatically selects the first element to display
 */
@Component({
  selector: 'wfw-carousel',
  imports: [
    Carousel,
    ProgressSpinner, XtRenderComponent,
    ReactiveFormsModule, Button
  ],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent <T extends ManagedData> extends AbstractDcWorkflow<T> implements OnInit, OnDestroy {

  protected bkObserver = inject(BreakpointObserver);
  protected formBuilder = inject(FormBuilder);

  isPortrait=toSignal(this.bkObserver.observe(Breakpoints.HandsetPortrait).pipe(map (result => {
    return result.matches;
  })));

  numVisible = computed<number>(() => {
    if (this.isPortrait()) return 1;
    else return 3;
  });

  carouselOrientation = computed<'horizontal'|'vertical'>(() => {
    if (this.isPortrait()) return 'vertical';
    else return 'horizontal';
  });

  selectedElement = signal<T | null>(null);
  protected editingEntity = signal<T | null>(null);
  protected editForm = signal<FormGroup>(this.formBuilder.group({}));
  protected canSave = signal(false);
  protected saving = signal(false);
  private subscriptions = new Subscription();

  @ViewChild('carouselRef') carousel?: Carousel;

  constructor() {
    super();
    effect(() => {
      const items = this.displayableElements();
      if (items.length > 0 && this.selectedElement() == null) {
        const numVis = this.numVisible();
        const center = Math.floor((numVis - 1) / 2);
        this.selectedElement.set(items[Math.min(center, items.length - 1)]);
      }
    });
  }

  override ngOnInit() {
    super.ngOnInit();
    this.fetchFromStore();
  }

  selectElement(element: T): void {
    this.selectedElement.set(element);
    const items = this.displayableElements();
    const index = items.indexOf(element);
    if (index === -1) return;
    const total = items.length;
    const offset = Math.floor((this.numVisible() - 1) / 2);
    const targetPage = Math.max(0, Math.min(index - offset, total - this.numVisible()));
    if (this.carousel) {
      this.carousel.page = targetPage;
    }
  }

  onCarouselPage(event: any): void {
    const page = event.page ?? 0;
    const items = this.displayableElements();
    if (items.length === 0) return;
    const numVis = this.numVisible();
    const centerIndex = page + Math.floor((numVis - 1) / 2);
    const index = Math.min(centerIndex, items.length - 1);
    this.selectedElement.set(items[index]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  editEntity(element: T): void {
    if (this.saving()) return;
    this.selectElement(element);
    this.editingEntity.set(element);
    this.updateEditForm();
  }

  cancelEdit(): void {
    this.editingEntity.set(null);
    this.canSave.set(false);
    this.saving.set(false);
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
      this.selectElement(savedValue);
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
