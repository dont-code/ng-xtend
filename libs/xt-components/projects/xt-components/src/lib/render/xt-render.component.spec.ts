import { TestBed } from '@angular/core/testing';

import { XtRenderComponent } from './xt-render.component';
import { Component, inject, provideExperimentalZonelessChangeDetection, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XtComponent } from '../xt-component';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

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
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const text = hostFixture.nativeElement.querySelector ('h2');
    expect (text.textContent).toContain("Test");

    host.value.set("NewValue");
    hostFixture.detectChanges();
    expect (text.textContent).toContain("NewValue");
  });

  it('should work in Forms',() => {
    const hostFixture = TestBed.createComponent(HostTestFormComponent);
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const text = hostFixture.nativeElement.querySelector ('#text_input') as HTMLInputElement;
    expect (text.value).toEqual("TestText");

    host.updateValue ("SecondValue");
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
  template: '@if (isInForm()) {<ng-container [formGroup]="formGroup()"><input id="text_input" [name]="formControlName()" type="text" [formControlName]="formControlName()" /></ng-container>} @else {<h2>Value is {{context().value()}}</h2>}'
})
export class TestCurrencyComponent extends XtSimpleComponent<string> {
}

@Component({
  selector:'test-host',
  standalone:true,
  imports: [CommonModule, XtRenderComponent, TestCurrencyComponent],
  template: '<h1>Test Currency Component</h1> <xt-render [componentType]="type()" displayMode="FULL_VIEW" [value]="value()" ></xt-render> '

})
export class HostTestSimpleComponent {
  type (): Type<XtComponent<string>> {
    return TestCurrencyComponent;
  }

  value = signal ('Test');
}

@Component({
  selector:'test-host',
  standalone:true,
  imports: [CommonModule, XtRenderComponent, TestCurrencyComponent, ReactiveFormsModule],
  template: '<h1>Test Form</h1> <form [formGroup]="formGroup"> <xt-render [componentType]="type()" displayMode="FULL_EDITABLE" [subName]="controlName()" [formGroup]="formGroup"></xt-render></form>'

})
export class HostTestFormComponent {
  builder = inject(FormBuilder);

  type (): Type<XtComponent<string>> {
    return TestCurrencyComponent;
  }

  formGroup= this.builder.group({
    testText: ['TestText']
  });

  updateValue (newVal:string) {
    this.formGroup.patchValue({testText: newVal});
  }

  retrieveValue (): string|null|undefined {
    return this.formGroup.value.testText;
  }

  controlName = signal('testText');
}

