import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtRenderComponent, XtResolverService } from 'xt-components';
import { ListDetailsComponent } from '../../../../workflow/src/lib/list-details/list-details.component';
import { Button } from 'primeng/button';
import { DcWorkflowModel, WfwRender } from 'dc-workflow';
import { StoreTestBed } from 'xt-store';
import { Select, SelectChangeEvent } from 'primeng/select';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    WfwRender,
    Select
  ],
  templateUrl: './test-workflow.component.html',
  styleUrl: './test-workflow.component.css'
})
export class TestWorkflowComponent implements OnInit, OnDestroy {

  protected resolver = inject(XtResolverService);
  protected builder = inject(FormBuilder);

  dataLoaded = signal<boolean>(false);

  protected subscriptions= new Subscription();

  constructor() {
    this.resolver.registerTypes({
      test: {
        name: 'string',
        creationDate:'date',
        value: 'number'
      }
    });
  }


  ngOnInit(): void {
    const storeTestBed = new StoreTestBed();
    storeTestBed.defineTestDataFor('test', [{
      name:'Test1',
      creationDate:new Date(2024,3,4),
      value: 12
    },{
      name:'ATest2',
      creationDate:new Date(2014,6,23),
      value: 22
    },{
      name:'Other Test',
      creationDate:new Date(2026,4,19),
      value: 34
    },{
      name:'Random Test',
      creationDate:new Date(2025,10,9),
      value: 4
    },{
      name:'New value Test',
      creationDate:new Date(2016,8,1),
      value: 64
    },{
      name:'Value Test',
      creationDate:new Date(2028,11,23),
      value: 34
    }]).then(() => {
      this.dataLoaded.set(true);
    });
  }

  protected sortField = signal<string>('name');
  protected sortDir = signal<'ascending' | 'descending'>('ascending');

  protected workflowConfig = computed<DcWorkflowModel>(() => ({
    entity:'test',
    workflow:this.workflowType() as 'list-detail'|'carousel',
    data: {
      sort: {
        [this.sortField()]: this.sortDir()
      }
    }
  }));

  protected workflowType = signal<string>('list-detail');

  protected toggleSort(field: string) {
    if (this.sortField() === field) {
      this.sortDir.update(d => d === 'ascending' ? 'descending' : 'ascending');
    } else {
      this.sortField.set(field);
      this.sortDir.set('ascending');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected setWorkflowType(value: string) {
    this.workflowType.set(value);
  }

  protected listWorkflowTypes():string[] {
    return ['list-detail','carousel']
  }
}
