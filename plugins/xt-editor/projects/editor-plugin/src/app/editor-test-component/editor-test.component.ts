import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtBaseContext, XtContext, XtResolverService } from 'xt-components';
import { EditorComponent } from '../../../../editor/src/lib/editor/editor.component';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-editor-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    JsonPipe
  ],
  templateUrl: './editor-test.component.html',
  styleUrl: './editor-test.component.css'
})
export class EditorTestComponent implements OnInit,OnDestroy {

  protected builder = inject(FormBuilder);

  protected resolver = inject (XtResolverService);
  protected readonly formValue = signal<any>(null);

  protected subscriptions= new Subscription();
  protected readonly simpleForm = signal<FormGroup>(this.builder.group({
    simpleText: ["Simple text"]
  }));

  constructor() {

  }

  ngOnInit() {
    this.subscriptions.add(this.simpleForm().valueChanges.subscribe({
      next: (value)=>this.formValue.set(value.simpleText)
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected simpleContext():XtContext<any> {
    const ret= new XtBaseContext('FULL_EDITABLE', "simpleText",this.simpleForm());
    return ret;
  }

}
