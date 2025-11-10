import { Component, inject, OnDestroy, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValueChangeEvent } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import {
  updateFormGroupWithValue,
  XtComponentOutput,
  XtRenderComponent,
  XtResolverService
} from 'xt-components';
import { Subscription } from 'rxjs';
import { StoreTestBed, XtStoreManagerService, XtSignalStore } from 'xt-store';
import { RecurringTask } from '../../../../agenda/src/lib/type-handlers/recurring-task';
import { ManagedData } from 'xt-type';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    JsonPipe, XtRenderComponent
  ],
  templateUrl: './agenda-test.component.html',
  styleUrl: './agenda-test.component.css'
})
export class AgendaTestComponent implements OnDestroy {

  subscriptions = new Subscription();

  protected builder = inject(FormBuilder);
  protected resolver= inject(XtResolverService);
  protected readonly storeMgr = inject(XtStoreManagerService);

  mainForm:WritableSignal<FormGroup> =signal(this.builder.group ({
      'editor': this.builder.group({})
    })
  );

  selectedTask = signal<AgendaTestType|null>(null);
  taskStore : XtSignalStore<AgendaTestType> | null = null;

  constructor() {

      // Register a dummy test type for displaying properly the values
    this.resolver.registerTypes({
      'agenda-test-type': {
        children:{
          name: 'string',
          date: 'date',
          recurrence: {
            type: 'recurring-task',
            referenceType: 'ONE'
          },
          completed: 'task-complete'
        },
        compatibleTypes: ['task']
      }
    });

    StoreTestBed.ensureMemoryProviderOnly();
    this.taskStore = this.storeMgr.getStoreFor('agenda-test-type') as XtSignalStore<AgendaTestType>;
    this.fillSampleListOfTask ();
  }

  async fillSampleListOfTask () {

      await this.taskStore?.storeEntity ({
        name:'Christmas',
        date: new Date(2025,11,25),
        recurrence: {
          name: 'Christmas',
          occurs: {
            every: 1,
            item: 'Year'
          }
        },
        completed:false

      });

    await this.taskStore?.storeEntity ({
      name:'Bi-Weekly Cleanup',
      date: new Date(2025,5,10),
      recurrence: {
        name: 'Cleanup',
        occurs: {
          every: 2,
          item: 'Week'
        }
      },
      completed:false
    });
  }

  outputChanged(newValue: XtComponentOutput | null) {
    if (newValue?.valueSelected!=null) {
      newValue?.valueSelected.subscribe (selected => {
        this.selectedTask.set(selected);
        this.updateEditForm();
      });
    }
  }

  updateEditForm () {

    const entity = this.selectedTask();
    const form = this.builder.group({}, {updateOn: 'change'});
    if (entity!=null) {
      updateFormGroupWithValue(form, entity, 'agenda-test-type', this.resolver.typeResolver);
    }
    this.mainForm.set( this.builder.group ({ editor: form }));
    // Update the value displayed from the form
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.subscriptions.add(form.valueChanges.subscribe( (value)=> {
      console.log("Event ");
        if (value!=null) {
          this.taskStore?.storeEntity(value as AgendaTestType);
          //this.selectedTask.set((value as any)?.value?.editor);
        }
    }));

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}

type AgendaTestType = ManagedData& {
  name: string;
  date: Date;
  recurrence: RecurringTask;
  completed: boolean;
}
