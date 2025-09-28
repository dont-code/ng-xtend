import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
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
    taskCompleted($event: CheckboxChangeEvent) {
        throw new Error('Method not implemented.');
    }

}
