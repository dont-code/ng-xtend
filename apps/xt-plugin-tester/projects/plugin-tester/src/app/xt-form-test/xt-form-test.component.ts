import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { XtBaseContext, XtContext } from 'xt-components';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

@Component({
  selector: 'app-xt-form-plugin-tester',
  standalone: true,
  imports: [NgComponentOutlet, ReactiveFormsModule, Button, Panel, Tag, JsonPipe, PageHeaderComponent],
  templateUrl: './xt-form-test.component.html',
  styleUrl: './xt-form-test.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XtFormTestComponent {
  protected readonly builder = inject(FormBuilder);

  mainForm = this.builder.group({
    currency: ['EUR'],
    other: [''],
  });

  validateForm(): void {
    this.mainForm.updateValueAndValidity();
  }

  currencyComponent() {
    return null;
  }

  otherComponent() {
    return null;
  }

  contextFor(subComponentName: string, inlineView: boolean, readOnly: boolean): XtContext<any> {
    const displayType = readOnly ? (inlineView ? 'INLINE_VIEW' : 'FULL_VIEW') : 'FULL_EDITABLE';
    return new XtBaseContext(displayType, subComponentName, this.mainForm);
  }
}
