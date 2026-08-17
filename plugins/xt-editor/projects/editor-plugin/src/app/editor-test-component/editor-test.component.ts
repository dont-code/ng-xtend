import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtBaseContext, XtContext, XtResolverService } from 'xt-components';
import { EditorComponent } from '../../../../editor/src/lib/editor/editor.component';

@Component({
  selector: 'app-editor-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EditorComponent
  ],
  templateUrl: './editor-test.component.html',
  styleUrl: './editor-test.component.css'
})
export class EditorTestComponent implements OnDestroy {

  protected builder = inject(FormBuilder);

  protected resolver = inject (XtResolverService);

  protected subscriptions= new Subscription();
  protected readonly simpleForm = signal<FormGroup>(this.builder.group({
    simpleText: ["Simple text"]
  }));

  constructor() {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected simpleContext():XtContext<any> {
    const ret= new XtBaseContext('FULL_EDITABLE', "simpleText",this.simpleForm());
    return ret;
  }
}
