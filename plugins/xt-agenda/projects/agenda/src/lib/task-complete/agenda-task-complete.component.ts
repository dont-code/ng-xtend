import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { XtMessageHandler, XtResolverService, XtSimpleComponent } from 'xt-components';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XtStoreManagerService } from 'xt-store';

@Component({
  selector: 'xt-agenda-task-complete',
  imports: [
    Checkbox,
    ReactiveFormsModule, FormsModule
  ],
  templateUrl: './agenda-task-complete.component.html',
  styleUrl: './agenda-task-complete.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaTaskCompleteComponent extends XtSimpleComponent<boolean> {
    msgHandler = inject(XtMessageHandler);
    resolver = inject(XtResolverService);
    storeMgr = inject(XtStoreManagerService);

    taskCompleted($event: CheckboxChangeEvent) {
      if ($event.checked==true) {
        this.resolver.runAction(this.context(), 'next-task', this.storeMgr).catch((error:any) => {
          this.msgHandler.errorOccurred(error, "Cannot create next task");
        });
      } else {
        this.resolver.runAction(this.context(), 'remove-next-task', this.storeMgr).catch((error:any) => {
          this.msgHandler.errorOccurred(error, "Cannot remove next task");
        });

      }
    }

}
