import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  input,
  viewChild,
  ViewChild
} from '@angular/core';
import { XtContext, XtSimpleComponent } from 'xt-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

@Component({
  selector: 'xt-editor-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent extends XtSimpleComponent<any> implements AfterViewInit{
  override context = input.required<XtContext<any>>();

  protected proseMirror = viewChild.required<ElementRef<HTMLDivElement>>('proseMirror');
  protected proseMirrorContent = viewChild.required<ElementRef<HTMLDivElement>>('proMirrorContent');

  constructor(private injector: Injector, private elementRef: ElementRef<HTMLElement>) {
    super();
  }
// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
  mySchema: Schema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
  });

  protected view: EditorView|null=null;

  ngAfterViewInit() {
    const proMirror=this.proseMirror();
    const proMirrorContent=this.proseMirrorContent();
    if( (proMirror!=null) && (proMirrorContent!=null)) {
      const doc= DOMParser.fromSchema(this.mySchema).parse(proMirrorContent.nativeElement);
      this.view = new EditorView(proMirror.nativeElement, {
        state: EditorState.create({
          doc: doc,
          plugins: exampleSetup({schema: this.mySchema})
        })
      })
    }
  /*  this.editor.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((jsonDoc) => {
      this.handleChange(jsonDoc);
    });*/
  }

}
