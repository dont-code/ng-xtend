import { Component, computed, inject, signal } from '@angular/core';
import { XtBaseContext, XtRenderComponent, XtRenderSubComponent, XtResolverService } from 'xt-components';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [ReactiveFormsModule, XtRenderComponent, XtRenderSubComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  protected xtResolver = inject (XtResolverService);
  protected builder = inject(FormBuilder);

  value = signal<{currency?:string, other?:string}>({});
  mainForm = this.builder.group ({
    currency: [this.value().currency],
    other: [this.value().other]
  });
  editContext = new XtBaseContext('FULL_EDITABLE', undefined, this.mainForm);
  inlineContext = new XtBaseContext('INLINE_VIEW', undefined);
  nonEditContext = new XtBaseContext('FULL_VIEW', undefined);

  subName = signal ('currency');

  constructor () {
    // We register the parent type for the xt-render-sub to find
    this.xtResolver.registerTypes({'TestComponent':{ 'currency':'currency', 'other':'other'}});
    this.editContext.valueType='TestComponent';
    this.nonEditContext.valueType='TestComponent';
    this.inlineContext.valueType='TestComponent';

    // Synchronize value with edited form
    this.nonEditContext.nonFormValue=this.value;
    this.inlineContext.nonFormValue =this.value;
    this.mainForm.valueChanges.pipe(takeUntilDestroyed()).subscribe({
      next: newValue => {
        this.value.update((value) => {
          for (const key in newValue) {
            const val= newValue[key as keyof typeof value];
            if( val!=undefined)
              value[key as keyof typeof value] = val;
          }
          return value;
        });
      }
    });
  }

  subInlineContext(){
    return this.inlineContext.subContext(this.subName(), this.xtResolver.typeResolver);
  }

  subNonEditContext () {
    return this.nonEditContext.subContext(this.subName(), this.xtResolver.typeResolver);
  }

  subEditContext = computed(() => {
    return this.editContext.subContext(this.subName(), this.xtResolver.typeResolver);
  });

  switchComponent($event:Event) {
    if (($event.currentTarget as any).checked) {
      this.subName.set( 'other');
    }
    else {
      this.subName.set ('currency');
    }

  }

}
