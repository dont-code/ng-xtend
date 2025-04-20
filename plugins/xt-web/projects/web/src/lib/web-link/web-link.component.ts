import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';

@Component({
  selector: 'xt-web-link',
  imports: [],
  templateUrl: './web-link.component.html',
  styleUrl: './web-link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebLinkComponent extends XtSimpleComponent{

}
