import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { XtBaseContext, XtContext, XtRenderSubComponent, XtResolverService, XtSimpleComponent } from 'xt-components';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XtTypeHandler, XtTypeReference } from 'xt-type';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'xt-many-to-one-ref',
  imports: [
    AutoComplete,
    ReactiveFormsModule,
    XtRenderSubComponent,
    FormsModule
  ],
  templateUrl: './many-to-one-ref.component.html',
  styleUrl: './many-to-one-ref.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManyToOneRefComponent extends XtSimpleComponent implements OnInit{
  resolver = inject(XtResolverService);
  filteredReferences=signal<any[]>([]);

  allReferences: any[] = [];
  allSourceReferences: any[] = [];
  allReferencesLoaded = false;

  typeHandler:XtTypeHandler<any>|null=null;

  /**
   * We have to go through a ngModel for the selection as we need to calculate the displayedLabel
   */
  selectedReference= signal<any>(null);

  override ngOnInit(): void {
    super.ngOnInit();
    const context=this.context();
    const value=context.formControlValue();

    this.typeHandler =this.resolver.findTypeHandlerOf(context, undefined, value)?.handler??null;
    firstValueFrom(this.resolver.findPossibleReferences(context)).then((references: any[]) => {
      this.allReferences = references.map((item) => {
        this.allSourceReferences.push(item);  // Store the original value
        return this.withDisplayLabel(item);
      });
      this.allReferencesLoaded=true;
    });
    this.selectedReference.set(this.withDisplayLabel(value));
  }

  withDisplayLabel(item:any):any {
    if (item==null) return item;
    let displayLabel=this.typeHandler?.stringToDisplay(item);
    if( displayLabel==null) {
      displayLabel=item._id;
    }
    return { displayLabel, ...item};
  }

  filterReferences($event:AutoCompleteCompleteEvent):void {
    const filterValue = $event.query;
    const refInfo = this.context().reference;
    if( refInfo!=null) {
      if (this.allReferencesLoaded) {
        this.filteredReferences.set(this.filterPossibleReferences(refInfo, filterValue));
      }
    }
  }

  protected filterPossibleReferences (refInfo:XtTypeReference, toSearch:string ): any[] {
    if ((toSearch==null) || (toSearch.length==0)) {
      return new Array(...this.allReferences);
    } else {
      const lowerSearch=toSearch.toLowerCase();
      return this.allReferences.filter((entity) => {
        const targetText=entity[refInfo.field];
        if (typeof targetText=='string') {
          return targetText.toLowerCase().includes(lowerSearch);
        } else {
          // Todo: Support filtering of anything else than string
          return true;
        }
      });
    }
  }

  contextForReference(ref:any):XtContext<any> {
    const thisContext=this.context() as XtBaseContext<any>;
    const ret = new XtBaseContext('INLINE_VIEW');
    ret.setDisplayValue(ref);
    ret.valueType=thisContext.reference?.toType;
    return ret;
  }

  changeSelection($event: any) {
    this.selectedReference.set($event);
    if( $event == null) {
      this.context().setFormValue($event,true);
    }else {
      const ref=this.allSourceReferences.find((ref) => ref._id==$event._id);
      this.context().setFormValue(ref,true);
    }
  }

}
