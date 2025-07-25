import { Component, effect, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { XtRenderComponent } from 'xt-components';
import { Panel } from 'primeng/panel';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { StoreManagerService, XtApiStoreProvider, XtMemoryStoreProvider } from 'xt-store';

@Component({
  selector: 'app-test',
  imports: [
    AutoComplete,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe, XtRenderComponent, Panel, Checkbox
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit, OnDestroy {

  protected builder = inject(FormBuilder);

  selectedType= signal<string>('image');

  docUrl = signal<string|null>(null);
  storeInMemory = signal(true);

  value = signal<any>({TestType:'string'});
  mainForm :FormGroup =this.builder.group ({
    TestType:[null]
  });

  protected storeMgr= inject(StoreManagerService);
  protected apiProvider = inject (XtApiStoreProvider);

  protected subscriptions= new Subscription();

  constructor() {
    effect(() => {
      this.updateStore (this.storeInMemory(), this.docUrl());
    });

  }

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

  updateStore(inMemory:boolean, docUrl:string|null) {
    if (inMemory) {
      this.storeMgr.setDefaultStoreProvider(new XtMemoryStoreProvider());
    }else {
      this.apiProvider.docUrl=docUrl??'';
      this.storeMgr.setDefaultStoreProvider(this.apiProvider);
    }
  }

  listofDocUrls():string[] {
    return [
      'https://test.dont-code.net/demo/documents',
      'https://collinfr.net/dont-code/documents',
      'http://localhost:8084/documents'];
  }
}
