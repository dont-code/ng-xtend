import { Component, inject, signal } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { Checkbox } from 'primeng/checkbox';
import { Panel } from 'primeng/panel';
import { XtApiStoreProvider, XtMemoryStoreProvider, XtStoreManagerService } from 'xt-store';
import { FormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';

@Component({
  selector: 'app-test-configure',
  imports: [
    AutoComplete,
    Checkbox,
    Panel,
    FormsModule,
    Fieldset
  ],
  templateUrl: './test-configure.component.html',
  styleUrl: './test-configure.component.css',
})
export class TestConfigureComponent {

  protected storeMgr= inject(XtStoreManagerService);
  protected apiProvider = inject (XtApiStoreProvider);

  storeInMemory = signal(true);
  docUrl = signal<string|null>(null);


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
