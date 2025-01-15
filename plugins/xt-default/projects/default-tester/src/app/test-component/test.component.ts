import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefaultPrimitiveComponent } from '../../../../default/src/lib/primitive/default-primitive.component';
import { JsonPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { XtRenderComponent } from 'xt-components';

@Component({
  selector: 'app-test',
  imports: [
    AutoComplete,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe, XtRenderComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit, OnDestroy {

  protected builder = inject(FormBuilder);

  selectedType= signal<string>('string');

  value = signal<any>({TestType:'string'});
  mainForm :FormGroup =this.builder.group ({
    TestType:[null]
  });

  protected subscriptions= new Subscription();

  listOfSimpleTypes() {
    return ['string', 'number', 'bigint','boolean','undefined','null', 'date'];
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

  simpleComponentType() {
    return DefaultPrimitiveComponent;
    }
}