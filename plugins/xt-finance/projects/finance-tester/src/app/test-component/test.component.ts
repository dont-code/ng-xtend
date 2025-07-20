import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { XtRenderComponent } from 'xt-components';
import { Panel } from 'primeng/panel';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-test',
  imports: [
    AutoComplete,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe, XtRenderComponent, Panel, Card
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit, OnDestroy {

  protected builder = inject(FormBuilder);

  selectedType= signal<string>('image');

  value = signal<any>({TestType:'string'});
  mainForm :FormGroup =this.builder.group ({
    TestType:[null]
  });

  protected subscriptions= new Subscription();

  listOfSimpleTypes() {
    return ['image','link', 'rating'];
  }

  typeSwitch($event: AutoCompleteSelectEvent) {
    this.selectedType.set($event.value);
    this.mainForm.setValue({TestType:null});
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToValueChanges();
  }

  protected listenToValueChanges() {
    // this.subscriptions.unsubscribe();
    this.subscriptions.add(this.mainForm.valueChanges.subscribe({
      next: newValue => {
        if (newValue.TestType !== undefined)
          this.value.set(newValue);
      }
    }));
  }

}
