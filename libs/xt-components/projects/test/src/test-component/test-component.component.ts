import { Component, EnvironmentInjector, Type, inject, runInInjectionContext, signal } from '@angular/core';
import { XtComponentsComponent, XtOtherComponent } from 'xt-components';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [NgComponentOutlet, XtComponentsComponent, XtOtherComponent],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss'
})
export class TestComponent {

  myComponent = signal (XtComponentsComponent);

  switchComponent($event:Event) {

    if (($event.currentTarget as any).checked == true)
      this.myComponent.set (XtOtherComponent);
    else
      this.myComponent.set (XtComponentsComponent);

  }
    
}
