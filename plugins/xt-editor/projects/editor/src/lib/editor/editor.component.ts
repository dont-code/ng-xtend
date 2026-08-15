import { ChangeDetectionStrategy, Component, ElementRef, Injector, Renderer2, ViewChild } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { basicSetup } from '../prose-mirror/basic-setup';

@Component({
  selector: 'xt-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent extends XtSimpleComponent{

  @ViewChild('proseMirror', { static: false }) private proseMirror: ElementRef | undefined;
  //private proseMirror: ElementRef | undefined;

  constructor(    private renderer: Renderer2, private injector: Injector, private elementRef: ElementRef<HTMLElement>,
  ) {
    super();
  }
// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
  mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
  });

  protected view: EditorView|null=null;

  override ngOnInit(): void {
    super.ngOnInit();
    if( this.proseMirror!=null) {
      this.view = new EditorView(null, {
        state: EditorState.create({
          doc: DOMParser.fromSchema(this.mySchema).parse(this.context().value()),
          plugins: basicSetup({schema: this.mySchema})
        })
      })

      this.renderer.appendChild(this.proseMirror.nativeElement, this.view.dom);
    }
  /*  this.editor.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((jsonDoc) => {
      this.handleChange(jsonDoc);
    });*/
  }

}
