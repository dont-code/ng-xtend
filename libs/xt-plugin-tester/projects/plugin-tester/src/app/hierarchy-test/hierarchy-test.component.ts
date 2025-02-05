import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { XtBaseContext, XtResolverService } from 'xt-components';

@Component({
  selector: 'app-hierarchy-plugin-tester',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './hierarchy-test.component.html',
  styleUrl: './hierarchy-test.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HierarchyTestComponent {

  protected builder = inject(FormBuilder);
  protected xtResolver = inject (XtResolverService);

  mainForm = this.builder.group ({
    toWho: ['Me'],
    payment: [{amount:234.5, currency:'EUR'}]
  });

  editContext = new XtBaseContext ('FULL_EDITABLE', undefined, this.mainForm);


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
