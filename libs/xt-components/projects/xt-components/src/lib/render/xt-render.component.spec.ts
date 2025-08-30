import { TestBed } from '@angular/core/testing';

import { XtRenderComponent } from './xt-render.component';
import { Component, output, provideZonelessChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HostTestFormComponent, HostTestSimpleComponent } from '../test/xt-test-helper-components';
import { Button } from 'primeng/button';
import { By } from '@angular/platform-browser';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';


describe('XtRenderComponent', () => {

  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtRenderComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
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
      testText: 'TestText'
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

  it('should support outputs',  () => new Promise<void>((resolve, reject) => {

    const hostFixture = TestBed.createComponent(HostTestSimpleComponent);
    hostFixture.componentRef.setInput('value', 1);
    hostFixture.componentRef.setInput('type', TestOutputComponent);

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const buttonFixture = hostFixture.debugElement.query(By.directive(Button));
    const buttonComp = buttonFixture.componentInstance as Button;

    const renderFixture=hostFixture.debugElement.query(By.directive(XtRenderComponent));
    const renderComponent = renderFixture.componentInstance as XtRenderComponent<any>
    expect (renderComponent.outputsObject.valueSelected).toBeTruthy();
    renderComponent.outputsObject.valueSelected!.subscribe((newValue) => {
      try {
        // The value increase has been well sent through the output
        expect (newValue).toEqual(2);
        resolve();
      } catch (error){
        reject (error);
      }
    });

    // Click on the button HTML component
    expect(buttonComp).toBeTruthy();
    expect(buttonFixture.nativeElement.textContent).toBe('Increase 1');

    buttonFixture.nativeElement.children[0].click();
    hostFixture.detectChanges();

    expect(buttonFixture.nativeElement.textContent).toBe('Increase 2');
  }));


});

@Component({
  selector: 'test-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '@if (isInForm()) {<ng-container [formGroup]="formGroup()"><input id="text_input" [name]="formControlName()" type="text" [formControlName]="formControlName()" /></ng-container>} @else {<h2>Value is {{context().displayValue()}}</h2>}'
})
export class TestCurrencyComponent extends XtSimpleComponent<string> {
}

@Component({
  selector: 'test-output',
  standalone: true,
  imports: [CommonModule, Button],
  template: '<p-button id="sendOutput" label="Increase {{context().displayValue()}}" (onClick)="incrementValue()"></p-button>',
})
export class TestOutputComponent extends XtSimpleComponent<number> {

  storeValue=output<number>();

  override setupInputOutput (): void {
    this.outputsObject.valueSelected=this.storeValue;
  }

  incrementValue (): void {
    const value = this.displayValue();
    this.context().setDisplayValue(value?value+1:1);
    this.storeValue.emit(this.displayValue()!);
  }
}

