import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef, inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { updateFormGroupWithValue, XtContext, XtRenderComponent, XtResolverService, XtSimpleComponent } from 'xt-components';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorState, NodeSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node, NodeType, Schema } from 'prosemirror-model';
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import { basicSetup, canInsert, openPrompt, TextField } from '../prose-mirror/basic-setup';
import { MarkdownPipe } from '../markdown/markdown-pipe';
import { InlineMarkdownPipe } from '../markdown/inline-markdown-pipe';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { MenuElement, MenuItem } from 'prosemirror-menu';
import { type } from '@ngrx/signals';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'xt-editor-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MarkdownPipe, InlineMarkdownPipe, Tooltip, Dialog,
    XtRenderComponent, ButtonDirective
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent extends XtSimpleComponent<any> implements AfterViewInit{
  override context = input.required<XtContext<any>>();

  protected resolver = inject(XtResolverService);

  protected editor = viewChild<ElementRef<HTMLDivElement>>('editor');

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
  protected displayEditImage = signal<boolean>(false);
  protected editImageForm = new FormGroup({});

  constructor() {
    super();
    const imageType=this.resolver.typeResolver.findType('image');
        // Register the type with the image type if supported
    this.resolver.registerTypes({
      editorImageType: {
        children: {
          src: (imageType==null)?"string":"image",
          title: "string",
          alt: "string"
        }
      }
    });

    updateFormGroupWithValue (this.editImageForm, {}, 'editorImageType', this.resolver.typeResolver);

    // Setup the editor once the divs are available
    effect(() => {
      const editor=this.editor();
      if( (editor!=null) && (this.view==null)) {
        const value=this.context().formControlValue();

        const doc = this.toProseMirrorDoc (value);
        this.view = new EditorView(editor.nativeElement, {
          state: EditorState.create({
            doc: doc,
            plugins: basicSetup({schema: this.mySchema, menuContent: {
              image: this.imageMenu(this.mySchema.nodes['image'], this)/*,
                link: this.linkMenu ()*/
              }})
          }),
          dispatchTransaction: this.handleTransactions.bind(this)
        })
      }

    })
  }

  ngAfterViewInit() {
  /*  this.editor.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((jsonDoc) => {
      this.handleChange(jsonDoc);
    });*/
  }

  protected imageMenu(imageNodeType:NodeType, that: EditorComponent):MenuElement {
    return new MenuItem({
      title: "Insert image",
      label: "Image",
      enable(state) {
        return canInsert(state, imageNodeType)
      },
      run(state, _, view) {
        let { from, to } = state.selection, attrs = { };
        if (state.selection instanceof NodeSelection && state.selection.node.type == imageNodeType)
          attrs = state.selection.node.attrs||{};
        updateFormGroupWithValue(that.editImageForm, attrs, "editorImageType", that.resolver.typeResolver);
        that.displayEditImage.set(true);
      }
    });
  }

  protected updateImageFromForm() {
    if (this.view != null) {
      this.view.dispatch(this.view.state.tr.replaceSelectionWith((this.mySchema.nodes['image']).createAndFill(this.editImageForm.value)!))
      this.view.focus()
      }
    this.displayEditImage.set(false);
  }

  /*protected linkMenu():MenuElement {
    return undefined;
  }*/

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
