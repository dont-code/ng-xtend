import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'xt-web-link',
  imports: [
    ReactiveFormsModule,
    InputText,
    Tooltip
  ],
  templateUrl: './web-link.component.html',
  styleUrl: './web-link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebLinkComponent extends XtSimpleComponent{

  calculateUrl(url: string): string {
    if (url==null) return url;

    if (url.includes('//')) {
      url = url.substring(url.indexOf('//')+2);
    }

    if (url.length>20)
      return url.substring(0, 17)+'...';
    else
      return url;
  }
}
