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
  templateUrl: './sample-currency.component.html',
  styleUrl: './sample-currency.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleCurrencyComponent extends XtSimpleComponent {
}
