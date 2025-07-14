import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { XtSimpleComponent } from 'xt-components';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'xt-sample-currency',
  standalone: true,
  imports: [CommonModule, InputNumberModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './intl-currency.component.html',
  styleUrl: './intl-currency.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntlCurrencyComponent extends XtSimpleComponent {
}
