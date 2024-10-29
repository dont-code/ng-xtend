import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {InputNumberModule} from 'primeng/inputnumber';
import {XtSimpleComponent} from 'xt-components';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'lib-xt-currency',
  standalone: true,
  imports: [CommonModule, InputNumberModule, ReactiveFormsModule],
  templateUrl: './xt-currency.component.html',
  styleUrl: './xt-currency.component.css'
})
export class XtCurrencyComponent extends XtSimpleComponent {
}
