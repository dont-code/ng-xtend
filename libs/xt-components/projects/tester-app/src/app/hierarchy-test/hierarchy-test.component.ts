import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { XtRenderComponent, XtBaseContext, XtResolverService } from 'xt-components';

@Component({
  selector: 'app-hierarchy-plugin-tester',
  standalone: true,
  imports: [ReactiveFormsModule, XtRenderComponent],
  templateUrl: './hierarchy-test.component.html',
  styleUrl: './hierarchy-test.component.scss'
})
export class HierarchyTestComponent {

  protected builder = inject(FormBuilder);

  mainForm = this.builder.group ({
    toWho: ['Me'],
    payment: [{amount:234.5, currency:'EUR'}]
  });

  editContext = new XtBaseContext ('FULL_EDITABLE', undefined, this.mainForm);

  xtResolver = inject (XtResolverService);

  constructor () {
    // Register the edited type
    this.xtResolver.registerTypes (
      {
        'TestPayment': {
          toWho: 'string',
          payment: 'money'
        }
      });
    this.editContext.valueType='TestPayment';
  }

}
