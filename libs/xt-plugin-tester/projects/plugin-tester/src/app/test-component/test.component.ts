import { Component, computed, inject, signal, Type } from '@angular/core';
import { XtBaseContext, XtComponent, XtRenderComponent, XtRenderSubComponent, XtResolverService } from 'xt-components';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

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

  mainForm = this.builder.group ({
    currency: ['EUR'],
    other: ['edit']
  });
  nonFormValue = signal({currency:'GBP', other:'view'})
  editContext = new XtBaseContext('FULL_EDITABLE', undefined, this.mainForm);

  subName = signal ('currency');

  constructor () {
    // We register the parent type for the xt-render-sub to find
    this.xtResolver.registerTypes({'TestComponent':{ 'currency':'currency', 'other':'other'}});
    this.editContext.valueType='TestComponent';
  }

  myComponentType = computed<Type<XtComponent>> (()=> {
    const found = this.xtResolver.findBestComponent (this.editContext, this.subName());
    return found.componentClass;
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
