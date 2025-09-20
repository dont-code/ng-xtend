import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { RecurringTask } from '../type-handlers/recurring-task';

@Component({
  selector: 'xt-agenda-recurring-task-complete',
  imports: [],
  templateUrl: './agenda-recurring-task-complete.component.html',
  styleUrl: './agenda-recurring-task-complete.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaRecurringTaskCompleteComponent extends XtSimpleComponent<RecurringTask> {

}
