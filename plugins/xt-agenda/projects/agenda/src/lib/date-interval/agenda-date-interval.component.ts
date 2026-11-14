import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { XtRenderSubComponent, XtSimpleComponent } from 'xt-components';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { ReactiveFormsModule } from '@angular/forms';
import { DateInterval } from '../type-handlers/date-interval';
import { Select } from '@openng/optimus-ui/select';

@Component({
  selector: 'xt-agenda-date-interval',
  imports: [
    InputNumber,
    ReactiveFormsModule,
    Select
  ],
  templateUrl: './agenda-date-interval.component.html',
  styleUrl: './agenda-date-interval.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaDateIntervalComponent extends XtSimpleComponent<DateInterval> implements OnInit {

  override ngOnInit(): void {
    super.ngOnInit();
    this.manageFormControl('every', true);
    this.manageFormControl('item', true);
  }

  allIntervalItems() {
    return ['Day', 'Week', 'Month', 'Year'];
  }
}
