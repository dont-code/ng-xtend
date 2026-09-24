import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtBaseContext, XtContext, XtResolverService } from 'xt-components';
import { EditorComponent } from '../../../../editor/src/lib/editor/editor.component';
import { JsonPipe } from '@angular/common';
import { MarkdownPipe } from '../../../../editor/src/lib/markdown/markdown-pipe';

@Component({
  selector: 'app-editor-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    MarkdownPipe
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
    simpleText: ["# Header\n\nSimple **text**"]
  }));

  constructor() {
  }

  ngOnInit() {
    this.subscriptions.add(this.simpleForm().valueChanges.subscribe({
      next: (value)=>this.formValue.set(value.simpleText)
    }));
    const initValue=this.simpleForm().value?.simpleText;
    if( initValue!=null) {
      this.formValue.set(initValue);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected simpleContext():XtContext<any> {
    const ret= new XtBaseContext('FULL_EDITABLE', "simpleText",this.simpleForm());
    return ret;
  }

  protected inlineContext():XtContext<any> {
    const ret= new XtBaseContext('INLINE_VIEW');
    ret.setDisplayValue(this.formValue());
    return ret;
  }

  protected fullviewContext():XtContext<any> {
    const ret= new XtBaseContext('FULL_VIEW');
    ret.setDisplayValue(this.formValue());
    return ret;
  }

}
