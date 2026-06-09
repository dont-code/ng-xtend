import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtRenderComponent } from 'xt-components';
import { ListDetailsComponent } from '../../../../workflow/src/lib/list-details/list-details.component';
import { DcWorkflowModel, WfwRender } from 'dc-workflow';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    XtRenderComponent,WfwRender
  ],
  templateUrl: './test-workflow.component.html',
  styleUrl: './test-workflow.component.css'
})
export class TestWorkflowComponent implements OnInit, OnDestroy {

  protected builder = inject(FormBuilder);

  protected subscriptions= new Subscription();


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
  }

  protected workflowType() {
    return ListDetailsComponent<any>;
  }

  protected workflowConfig(): DcWorkflowModel {
    return {
      entity:'test',
      workflow:'list-detail',
      data: {
        sort: {
          'name':"ascending"
        }
      }
    };
  }
}
