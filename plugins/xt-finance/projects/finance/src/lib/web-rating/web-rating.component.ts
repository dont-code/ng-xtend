import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { Rating } from 'primeng/rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'xt-web-rating',
  imports: [
    Rating,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './web-rating.component.html',
  styleUrl: './web-rating.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebRatingComponent extends XtSimpleComponent{

}
