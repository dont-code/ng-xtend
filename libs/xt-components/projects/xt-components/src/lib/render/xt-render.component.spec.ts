import { TestBed } from '@angular/core/testing';

import { XtRenderComponent } from './xt-render.component';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HostTestFormComponent, HostTestSimpleComponent } from '../test/xt-test-helper-components';

describe('XtRenderComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtRenderComponent, ReactiveFormsModule],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

  });

  it('should be embeddable', () => {
    const hostFixture = TestBed.createComponent(HostTestSimpleComponent);
    hostFixture.componentRef.setInput('type', TestCurrencyComponent);
    hostFixture.componentRef.setInput('value', 'Test');
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const text = hostFixture.nativeElement.querySelector ('h2');
    expect (text.textContent).toContain("Test");

    hostFixture.componentRef.setInput('value','NewValue');
    hostFixture.detectChanges();
    expect (text.textContent).toContain("NewValue");
  });

  it('should work in Forms',() => {
    const hostFixture = TestBed.createComponent(HostTestFormComponent);
    hostFixture.componentRef.setInput('type', TestCurrencyComponent);
    hostFixture.componentRef.setInput('formDescription', {
      testText: ['TestText']
    });
    hostFixture.componentRef.setInput('controlName', 'testText');
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const text = hostFixture.nativeElement.querySelector ('#text_input') as HTMLInputElement;
    expect (text.value).toEqual("TestText");

    host.patchValue ("SecondValue");
    hostFixture.detectChanges();
    expect (text.value).toEqual("SecondValue");

    text.value="Third";
    text.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect (host.retrieveValue()).toEqual ("Third");
  });

});

@Component({
  selector: 'test-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '@if (isInForm()) {<ng-container [formGroup]="formGroup()"><input id="text_input" [name]="formControlName()" type="text" [formControlName]="formControlName()" /></ng-container>} @else {<h2>Value is {{context().displayValue()}}</h2>}'
})
export class TestCurrencyComponent extends XtSimpleComponent<string> {
}


