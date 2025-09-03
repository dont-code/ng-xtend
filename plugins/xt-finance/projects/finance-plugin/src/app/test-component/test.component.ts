import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { XtRenderComponent, XtResolverService } from 'xt-components';
import { Card } from 'primeng/card';
import { DummyCurrencyComponent } from '../dummy-currency/dummy-currency.component';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    JsonPipe, XtRenderComponent, Card
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {

  protected builder = inject(FormBuilder);

  mainForm :FormGroup =this.builder.group ({
    Euro:this.builder.group({
      currency:[null],
      amount:[null]
    }),
    Dollar:this.builder.group({
      currency:[null],
      amount:[null]
    }),
    Other:this.builder.group({
      currency:[null],
      amount:[null]
    })
  });

  protected resolver=inject(XtResolverService);

  constructor() {
    // Add the currency plugin to allow test
    this.resolver.registerPlugin({
      name:'dummy-currency',
      components:[{
        componentName:'DummyCurrency',
        componentClass: DummyCurrencyComponent,
        typesHandled:['currency']
      }]
    })
  }
}
