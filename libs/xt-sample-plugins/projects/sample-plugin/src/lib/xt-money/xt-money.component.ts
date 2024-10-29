import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Money } from './xt-money.model';
import {XtCompositeComponent, XtRenderComponent} from 'xt-components';

@Component({
  selector: 'lib-xt-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XtRenderComponent],
  templateUrl: './xt-money.component.html',
  styleUrl: './xt-money.component.css'
})
export class XtMoneyComponent extends XtCompositeComponent<Money>{
  currency= computed<string|undefined> (() => {
    return this.context()?.value()?.currency;
  });
}
