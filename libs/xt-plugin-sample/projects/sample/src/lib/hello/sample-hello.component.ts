import {Component} from '@angular/core';
import {XtSimpleComponent} from 'xt-components';

@Component({
  selector: 'xt-sample-hello',
  standalone: true,
  imports: [],
  templateUrl: './sample-hello.component.html',
  styleUrl: './sample-hello.component.css'
})
export class SampleHelloComponent extends XtSimpleComponent<string>{

}
