import { Component, computed, inject, signal, Type } from '@angular/core';
import {
  XtComponent,
  XtComponentInfo,
  XtRenderComponent,
  XtRenderSubComponent,
  XtResolverService
} from 'xt-components';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, XtRenderComponent, XtRenderSubComponent, AutoCompleteModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  protected xtResolver = inject (XtResolverService);
  protected builder = inject(FormBuilder);

  value = signal<{[keys:string]:any}>({ TestComponent:{}});
  mainForm = this.builder.group ({
    TestComponent:['']
  });
  /*editContext = new XtBaseContext('FULL_EDITABLE', 'TestComponent', this.mainForm);
  inlineContext = new XtBaseContext('INLINE_VIEW', undefined);
  fullViewContext = new XtBaseContext('FULL_VIEW', undefined);*/

  component = signal<XtComponentInfo<any> | null> (null);
  protected query:string|null = null;

  constructor () {
    // Synchronize value with edited form
    /*this.fullViewContext.nonFormValue=this.value;
    this.inlineContext.nonFormValue =this.value;*/
    this.mainForm.valueChanges.pipe(takeUntilDestroyed()).subscribe({
      next: newValue => {
        this.value.update((value) => {
          for (const key in newValue) {
            const val= newValue[key as keyof typeof newValue];
            if( val!=undefined)
              value[key as keyof typeof value] = val;
          }
          return value;
        });
      }
    });
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
}
