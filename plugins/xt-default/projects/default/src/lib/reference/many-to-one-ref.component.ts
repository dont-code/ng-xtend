import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { XtBaseContext, XtCompositeComponent, XtContext, XtRenderSubComponent, XtResolverService, XtSimpleComponent } from 'xt-components';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { XtTypeReference} from 'xt-type';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'xt-many-to-one-ref',
  imports: [
    AutoComplete,
    ReactiveFormsModule,
    Button,
    XtRenderSubComponent
  ],
  templateUrl: './many-to-one-ref.component.html',
  styleUrl: './many-to-one-ref.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManyToOneRefComponent extends XtSimpleComponent{
  resolver = inject(XtResolverService);
  filteredReferences = signal<any[]>([]);

  allReferences: any[] = [];
  allReferencesLoaded = false;

  filterReferences($event:AutoCompleteCompleteEvent):void {
    const filterValue = $event.query;
    const refInfo = this.context().reference;
    if( refInfo!=null) {
      if (!this.allReferencesLoaded) {
        this.allReferencesLoaded = true;
        firstValueFrom(this.resolver.findPossibleReferences(this.context())).then ((references:any[]) => {
          this.allReferences = references;
          this.filteredReferences.set(this.filterPossibleReferences(refInfo, filterValue));
        });
      } else {
        this.filteredReferences.set(this.filterPossibleReferences(refInfo, filterValue));
      }
    }
  }

  protected filterPossibleReferences (refInfo:XtTypeReference, toSearch:string ): any[] {
    if ((toSearch==null) || (toSearch.length==0)) {
      return this.allReferences;
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
}
