import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StoreManagerService } from '../store/store-manager.service';
import { updateFormGroupWithValue, XtRenderComponent } from 'xt-components';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManagedData } from 'xt-type';
import { XtSignalStore } from '../store/store-entity-feature/store-entity-feature';

@Component({
  selector: 'app-entity-manager',
  imports: [XtRenderComponent, ReactiveFormsModule],
  providers: [],
  templateUrl: './entity-manager.component.html',
  styleUrl: './entity-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityManagerComponent {
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

  editedEntity = signal<ManagedData|null>(null);

  editForm = computed( () => {
    const entity = this.editedEntity();
    const form = this.formBuilder.group({});
    if (entity!=null) {
      updateFormGroupWithValue(form, entity);
    }
    return this.formBuilder.group ({ editor: form });
  });

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

}
