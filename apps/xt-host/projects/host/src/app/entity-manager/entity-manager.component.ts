import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XtResolverService } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { DcWorkflowModel, WfwRender } from 'dc-workflow';
import { ApplicationModelManagerService } from '../application-model-manager/application-model-manager.service';

@Component({
  selector: 'app-entity-manager',
  imports: [WfwRender, ReactiveFormsModule],
  providers: [],
  templateUrl: './entity-manager.component.html',
  styleUrl: './entity-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityManagerComponent {
  private readonly route = inject(ActivatedRoute);
  protected applicationModel = inject(ApplicationModelManagerService);

  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly resolver = inject (XtResolverService);

  /**
   * Support for setting entity name as an input and as a route.
   */
  entityNameInput = input<string>();

  entityName = linkedSignal( () => {
    return this.entityNameInput();
  });

  protected readonly workflowConfig = signal<DcWorkflowModel | undefined>(undefined);

  constructor() {
    this.route.paramMap.pipe(
      takeUntilDestroyed(),
    ).subscribe(params => {
//      console.debug("Changed entity name", params);
      this.entityName.set(params.get("entityName")??undefined);
      this.updateWorkflow();
    });
  }

  updateWorkflow () {
//    console.debug("EntityManager Start Updateworkflow");
    const entityName = this.entityName();
    if (entityName != null) {
      let wfw: DcWorkflowModel | undefined = this.applicationModel.getWorkflowFor(entityName);
      if (wfw == null) {
        // No workflow configured for this entity, let's generate a default one
        wfw = {
          entity: entityName,
          workflow: 'list-detail'
        };
//        console.debug("EntityManager New Wfw");

      }
//      console.debug("EntityManager setting Wfw ");
      this.workflowConfig.set(wfw);
    } else {
      this.workflowConfig.set(undefined);
    }
  }

}
