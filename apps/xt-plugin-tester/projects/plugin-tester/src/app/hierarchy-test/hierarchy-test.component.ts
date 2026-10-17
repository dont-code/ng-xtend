import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

@Component({
  selector: 'app-hierarchy-plugin-tester',
  standalone: true,
  imports: [ReactiveFormsModule, InputText, Panel, Tag, JsonPipe, PageHeaderComponent],
  templateUrl: './hierarchy-test.component.html',
  styleUrl: './hierarchy-test.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyTestComponent {
  protected readonly builder = inject(FormBuilder);
  protected readonly xtResolver = inject(XtResolverService);

  mainForm = this.builder.group({
    toWho: ['Me'],
    payment: [{ amount: 234.5, currency: 'EUR' }],
  });

  editContext = new XtBaseContext('FULL_EDITABLE', undefined, this.mainForm);

  constructor() {
    // Register the edited type
    this.xtResolver.registerTypes({
      money: {
        amount: 'number',
        currency: 'string',
      },
      TestPayment: {
        toWho: 'string',
        payment: 'money',
      },
    });
    this.editContext.valueType = 'TestPayment';
  }
}
