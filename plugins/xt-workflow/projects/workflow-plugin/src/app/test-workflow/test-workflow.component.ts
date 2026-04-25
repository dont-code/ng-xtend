import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtRenderComponent } from 'xt-components';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    XtRenderComponent
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
}
