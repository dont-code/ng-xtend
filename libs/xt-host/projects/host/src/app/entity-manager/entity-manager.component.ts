import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StoreManagerService } from '../store/store-manager.service';
import { XtRenderComponent } from 'xt-components';

@Component({
  selector: 'app-entity-manager',
  imports: [XtRenderComponent],
  providers: [],
  templateUrl: './entity-manager.component.html',
  styleUrl: './entity-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityManagerComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly storeMgr = inject(StoreManagerService);

  entityName = signal<string|null>(null);
  store = computed(() => {
    const entityName = this.entityName();
    if (entityName!=null) {
      return this.storeMgr.getStoreFor(entityName);
    } else {
      return undefined;
    }
  })

  constructor() {
    this.route.paramMap.pipe(
      takeUntilDestroyed(),
    ).subscribe(params => {
      this.entityName.set(params.get("entityName"));
    })
  }

}
