import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { XtRenderComponent } from 'xt-components';
import { Card } from 'primeng/card';

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
}
