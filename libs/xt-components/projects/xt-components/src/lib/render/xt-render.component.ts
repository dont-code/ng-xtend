import { Component, input } from '@angular/core';

@Component({
  selector: 'xt-render',
  standalone: true,
  imports: [],
  templateUrl: './xt-render.component.html',
  styleUrl: './xt-render.component.css'
})
export class XtRenderComponent {

  subName = input<string> ();
}
