import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { attachToFormGroup, XtRenderComponent, XtResolverService } from 'xt-components';
import { Panel } from 'primeng/panel';
import { Checkbox } from 'primeng/checkbox';
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
  mainForm :FormGroup =this.builder.group ({  });

  protected resolver = inject (XtResolverService);

  selectedType= signal<string>('link');

  docUrl = signal<string|null>(null);
  storeInMemory = signal(true);

  value = signal<any>('https://ng-xtend.dev');

  protected storeMgr= inject(StoreManagerService);
  protected apiProvider = inject (XtApiStoreProvider);

  protected subscriptions= new Subscription();

  constructor() {

  }

  listOfSimpleTypes() {
    return ['image','link', 'rating'];
  }

  typeSwitch($event: AutoCompleteSelectEvent) {
    attachToFormGroup(this.mainForm, 'TestType', null, $event.value, this.resolver.typeResolver);
    this.selectedType.set($event.value);
//    this.mainForm.setValue();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    attachToFormGroup(this.mainForm, 'TestType', this.value(), this.selectedType(), this.resolver.typeResolver);

    this.listenToValueChanges();
  }

  protected listenToValueChanges() {
    // this.subscriptions.unsubscribe();
    this.subscriptions.add(this.mainForm.valueChanges.subscribe({
      next: newValue => {
        if (newValue.TestType !== undefined)
          this.value.set(newValue.TestType);
      }
    }));
  }

  updateStore() {
    if (this.storeInMemory()) {
      this.storeMgr.setDefaultStoreProvider(new XtMemoryStoreProvider());
    }else {
      this.apiProvider.docUrl=this.docUrl()??'';
      this.storeMgr.setDefaultStoreProvider(this.apiProvider);
    }
  }

  listofDocUrls():string[] {
    return [
      'https://test.dont-code.net/demo/documents',
      'https://collinfr.net/dont-code/documents',
      'http://localhost:8084/documents'];
  }

  docUrlChanged($event: string) {
    if (($event==null)||($event.length==0)){
      this.storeInMemory.set(true);
    } else  this.storeInMemory.set(false);
    this.docUrl.set($event);
    this.updateStore();
  }

  inMemoryChanged($event: boolean) {
    this.storeInMemory.set($event);
    this.updateStore();
  }
}
