import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { XtSimpleComponent, XtMessageHandler, XtResolverService } from 'xt-components';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'xt-agenda-recurring-task-complete',
  imports: [
    Checkbox,
    ReactiveFormsModule, FormsModule
  ],
  templateUrl: './agenda-recurring-task-complete.component.html',
  styleUrl: './agenda-recurring-task-complete.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaRecurringTaskCompleteComponent extends XtSimpleComponent<boolean> {
    msgHandler = inject(XtMessageHandler);
    resolver = inject(XtResolverService);

    taskCompleted($event: CheckboxChangeEvent) {
      if ($event.checked==true) {
        this.resolver.runAction(this.context(), 'next-task').catch((error:any) => {
          this.msgHandler.errorOccurred(error, "Cannot create next task");
        });
      }
    }

}
