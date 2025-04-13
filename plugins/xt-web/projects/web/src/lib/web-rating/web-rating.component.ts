import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';

@Component({
  selector: 'xt-web-rating',
  imports: [],
  templateUrl: './web-rating.component.html',
  styleUrl: './web-rating.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebRatingComponent extends XtSimpleComponent{

}
