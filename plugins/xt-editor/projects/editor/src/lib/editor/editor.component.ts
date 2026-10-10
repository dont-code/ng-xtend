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
import { MarkType, Node, NodeType, Schema } from 'prosemirror-model';
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import { basicSetup, canInsert, markActive, openPrompt, TextField } from '../prose-mirror/basic-setup';
import { MarkdownPipe } from '../markdown/markdown-pipe';
import { InlineMarkdownPipe } from '../markdown/inline-markdown-pipe';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { icons, MenuElement, MenuItem } from 'prosemirror-menu';
import { type } from '@ngrx/signals';
import { ButtonDirective } from 'primeng/button';
import { toggleMark } from 'prosemirror-commands';

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

  /**
   * Enable dialog box for image or link editing
   * @protected
   */
  protected displayAttrDialog = signal<boolean>(false);
  protected editAttrForm = new FormGroup({});
  protected editAttrNodeType:NodeType|MarkType=(this.mySchema as any)['image'];
  protected editAttrValueType: string = "editorImageType";

  constructor() {
    super();
    const imageType=this.resolver.typeResolver.findType('image');
    const linkType=this.resolver.typeResolver.findType('link');
        // Register the type with the image type if supported
    this.resolver.registerTypes({
      editorImageType: {
        children: {
          src: (imageType==null)?"string":"image",
          title: "string",
          alt: "string"
        }
      },
      editorLinkType: {
        children: {
          href: (linkType==null)?"string":"link",
          title: "string"
        }
      }
    });

    updateFormGroupWithValue (this.editAttrForm, {}, 'editorImageType', this.resolver.typeResolver);

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
                image: this.imageMenu(this.mySchema.nodes['image'], this),
                link: this.linkMenu (this.mySchema.marks['link'], this)
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
        let { from, to } = state.selection, attrs: {src?:string, title?:string, alt?:string} = { };
        if (state.selection instanceof NodeSelection && state.selection.node.type == imageNodeType)
          attrs = state.selection.node.attrs||{};
        if (attrs.alt==null)
          attrs.alt= state.doc.textBetween(from, to, " ");
        that.editAttrValueType="editorImageType";
        updateFormGroupWithValue(that.editAttrForm, attrs, that.editAttrValueType, that.resolver.typeResolver);
        that.editAttrNodeType=imageNodeType;
        that.displayAttrDialog.set(true);
      }
    });
  }

  protected updateAttrsFromForm() {
    if (this.view != null) {
      if (this.editAttrValueType == "editorImageType"){
        this.view.dispatch(this.view.state.tr.replaceSelectionWith((this.mySchema.nodes['image']).createAndFill(this.editAttrForm.value)!))
      } else if (this.editAttrValueType == "editorLinkType"){
        toggleMark(this.editAttrNodeType as MarkType, this.editAttrForm.value)(this.view.state, this.view.dispatch)
      }
      this.view.focus()
      }
    this.displayAttrDialog.set(false);
  }

  protected linkMenu(linkMarkType:MarkType, that: EditorComponent):MenuElement {
    return new MenuItem({
      title: "Add or Remove link",
      icon: icons["link"],
      active(state) { return markActive(state, linkMarkType) },
      enable(state) { return !state.selection.empty },
      run(state, _, view) {
        let { from, to } = state.selection, attrs: {href?:string, title?:string} = { };
        if (markActive(state, linkMarkType)) {
          toggleMark(linkMarkType)(state, view.dispatch)
          return true
        }
        that.editAttrValueType="editorLinkType";
        updateFormGroupWithValue(that.editAttrForm, attrs, that.editAttrValueType, that.resolver.typeResolver);
        that.editAttrNodeType=linkMarkType;
        that.displayAttrDialog.set(true);
        return true;
      }
    });
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
