import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { XtRenderComponent, XtResolverService } from 'xt-components';
import { Card } from 'primeng/card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    JsonPipe, XtRenderComponent, Card
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnDestroy {

  subscriptions = new Subscription();

  protected builder = inject(FormBuilder);
  protected resolver= inject(XtResolverService);

  mainForm :FormGroup =this.builder.group ({
    name:['Example Task'],
    dateInterval:this.builder.group({
      every:[1],
      item:['Week']
    }),
    completed: [false]
  });

  listOfTasks  = signal<Array<any>> ([]);

  constructor() {
      // Register a dummy test type for displaying properly the values
    this.resolver.registerTypes({
      'agenda-test-type': {
        name: 'string',
        dateInterval: 'date-interval',
        completed: 'recurring-task-complete'
      }
    });

    this.listOfTasks.set(this.mainForm.value);
      // Update the value displayed from the form
    this.subscriptions.add(this.mainForm.events.subscribe({
      next: (value) => {
        if ((value as any)?.value!=null) {
          this.listOfTasks.set([(value as any)?.value]);
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
