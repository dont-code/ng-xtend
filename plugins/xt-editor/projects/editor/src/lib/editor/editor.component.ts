import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';
import { XtContext, XtSimpleComponent } from 'xt-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import { basicSetup } from '../prose-mirror/basic-setup';
import { MarkdownPipe } from '../markdown/markdown-pipe';
import { InlineMarkdownPipe } from '../markdown/inline-markdown-pipe';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'xt-editor-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MarkdownPipe, InlineMarkdownPipe, Tooltip
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent extends XtSimpleComponent<any> implements AfterViewInit{
  override context = input.required<XtContext<any>>();

  protected editor = viewChild.required<ElementRef<HTMLDivElement>>('editor');

  protected sampleJson={ "type": "doc", "content": [ { "type": "heading", "attrs": { "level": 1 }, "content": [ { "type": "text", "text": "Example Text" } ] }, { "type": "paragraph", "content": [ { "type": "text", "text": "s it working ?" } ] } ] };
  protected emptyJson={ "type": "doc", "content": [ { "type": "paragraph"} ] };
// Mix the nodes from prosemirror-schema-list into the basic schema to create a schema with list support.
  /** mySchema: Schema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
  });*/
  // Creates the markdown schema
  mySchema = schema;

  protected view: EditorView|null=null;

  ngAfterViewInit() {
    const editor=this.editor();
    if( editor!=null) {
      const value=this.context().formControlValue();

      const doc = this.toProseMirrorDoc (value);
      this.view = new EditorView(editor.nativeElement, {
        state: EditorState.create({
          doc: doc,
          plugins: basicSetup({schema: this.mySchema})
        }),
        dispatchTransaction: this.handleTransactions.bind(this)
      })
    }
  /*  this.editor.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((jsonDoc) => {
      this.handleChange(jsonDoc);
    });*/
  }

  protected handleTransactions(tr: Transaction): void {
    if (this.view!=null) {
      const state = this.view.state.apply(tr);
      this.view.updateState(state);

      if (tr.docChanged) {
        const markdown = defaultMarkdownSerializer.serialize(state.doc);
        this.context().setFormValue(markdown, true);
      }
    } else {
      console.error("Editor: View transaction received while no view defined.",tr.doc.toJSON());
    }
  }


  private toProseMirrorDoc(value: any): Node {
    if (value == null) {
      return this.mySchema.nodeFromJSON ( this.emptyJson);
    }
    if (typeof value === 'string') {
      // This is a markdown text,
      return defaultMarkdownParser.parse(value);
    }
    return this.mySchema.nodeFromJSON (value);
  }

  protected textJson (text:string){
    return { "type": "doc", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": text } ] } ] }
  };

}
