import { Component, signal } from '@angular/core';
import { XtCurrencyComponent, XtOtherComponent, XtContext } from 'xt-components';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [NgComponentOutlet, XtCurrencyComponent, XtOtherComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  myComponent = signal (XtCurrencyComponent);

  switchComponent($event:Event) {

    if (($event.currentTarget as any).checked == true)
      this.myComponent.set (XtOtherComponent);
    else
      this.myComponent.set (XtCurrencyComponent);

  }

  contextFor (subComponentName:string, inlineView:boolean, readOnly:boolean): XtContext {
    return {displayMode:inlineView?'INLINE_VIEW':'FULL_VIEW', readOnly};
  }
    
}
