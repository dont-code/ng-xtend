import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, Type } from '@angular/core';
import {
  XtComponent,
  XtComponentInfo,
  XtRenderComponent,
  XtResolverService
} from 'xt-components';
import { FormBuilder, FormGroup, FormsModule, PristineChangeEvent, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, XtRenderComponent, AutoCompleteModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TestComponent implements OnInit, OnDestroy {

  protected xtResolver = inject (XtResolverService);
  protected builder = inject(FormBuilder);

  value = signal<any>({TestComponent:null});
  mainForm :FormGroup =this.builder.group ({
  });

  component = signal<XtComponentInfo<any> | null> (null);
  protected query:string|null = null;

  protected subscriptions= new Subscription();

  constructor () {
    // Synchronize value with edited form
    /*this.fullViewContext.nonFormValue=this.value;
    this.inlineContext.nonFormValue =this.value;*/
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToValueChanges();
  }

  /*  subInlineContext = computed (()=> {
      return this.inlineContext.subContext(this.subName(), this.xtResolver.typeResolver);
    });

    subNonEditContext () {
      return this.nonEditContext.subContext(this.subName(), this.xtResolver.typeResolver);
    }

    subEditContext = computed(() => {
      return this.editContext.subContext(this.subName(), this.xtResolver.typeResolver);
    });*/
  componentClass = computed<Type<XtComponent<any>>>(() => {
    return this.component()?.componentClass;
  });

  suggestedComponents(): XtComponentInfo<any>[] {
    return this.xtResolver.listComponents ().filter((value) => {
      if ((this.query==null)||(this.query.length==0)) return true;
      else return value.componentName.indexOf(this.query)!=-1;
    });
  }

  completeName($event: any) {
    this.query=$event.query;
  }

  componentValid():boolean {
    const comp = this.component();
    return ((comp!=null) && (comp.componentClass!=null))
  }

  componentSwitch($event: AutoCompleteSelectEvent) {
    // Reset the mainForm
    this.mainForm.removeControl('TestComponent');
    this.component.set($event.value);
  }

  valueType = computed<string|undefined>( () => {
    const comp = this.component();
    if(( comp?.typesHandled!=null) && (comp.typesHandled.length > 0)) {
      return comp.typesHandled[0];
    } else {
      return undefined;
    }
  });

  protected listenToValueChanges() {
   // this.subscriptions.unsubscribe();
    this.subscriptions.add(this.mainForm.valueChanges.subscribe({
      next: newValue => {
        /*this.value.update((value) => {
          for (const key in newValue) {
            const val = newValue[key as keyof typeof newValue];
            if (val != undefined) {
              if (value==null) value={};
              value[key as keyof typeof value] = val;
            }
          }
          return value;
        });*/
        if (newValue.TestComponent !== undefined)
          this.value.set(newValue);
      }
    }));

  /*  this.subscriptions.add(this.mainForm.events.subscribe ({
      next: event => {
        const pristine:boolean|undefined = (event as PristineChangeEvent).pristine;
        if ((pristine!=null) && (!pristine)) {
          this.value.set(this.mainForm.value);
          this.mainForm.markAsPristine({onlySelf:false, emitEvent:false});
        }
      },
      error:err => {console.error (err)},
      complete:() => {console.debug ('Complete')
      }
    }));*/
  }
}
