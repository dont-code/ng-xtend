import { TestBed } from '@angular/core/testing';

import { XtRenderSubComponent } from './xt-render-sub.component';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { XtCompositeComponent } from '../xt-composite/xt-composite.component';
import { expect } from '@jest/globals';
import { HostTestTypedComponent } from '../test/xt-test-helper-components';
import { XtResolverService } from '../angular/xt-resolver.service';

describe('XtRenderSubComponent', () => {

  let resolverService:XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtRenderSubComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
      .compileComponents();

    resolverService=TestBed.inject(XtResolverService);
    resolverService.registerPlugin(TEST_MONEY_PLUGIN_INFO);
  });

  it('should support Money component by type', () => {

    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', {amount:1.4, currency: 'EUR'} as TestMoney);
    hostFixture.componentRef.setInput('valueType', 'TestMoney');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const textAmount = hostFixture.nativeElement.querySelector('h2');
    expect(textAmount.textContent).toBe('Amount: 1.4');
    const textCurrency = hostFixture.nativeElement.querySelector('h3');
    expect(textCurrency.textContent).toContain('Currency EUR');

    hostFixture.componentRef.setInput('value', {amount:4.4, currency: 'USD'} as TestMoney);
    hostFixture.detectChanges();
    expect(textAmount.textContent).toBe('Amount: 4.4');
    expect(textCurrency.textContent).toContain('Currency USD');

  });

/*  it('should support forms', () => {
    const hostFixture = TestBed.createComponent(HostTestFormComponent);
    hostFixture.componentRef.setInput('type', TestMoneyTypedComponent);
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const text = hostFixture.nativeElement.querySelector('#text_input') as HTMLInputElement;
    expect(text.value).toEqual("EUR");

    host.updateValue("USD");
    hostFixture.detectChanges();
    expect(text.value).toEqual("USD");

    text.value = "GBP";
    text.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(host.retrieveValue()).toEqual("GBP");
  });*/
});

@Component({
  selector: 'test-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '@if (isInForm()) {<ng-container [formGroup]="formGroup()"><input id="text_input" [name]="formControlName()" type="text" [formControlName]="formControlName()" /></ng-container>} @else {Currency {{context().value()}}}'
})
export class TestCurrencyComponent extends XtSimpleComponent<string> {
}

@Component({
  selector: 'test-money-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XtRenderSubComponent],
  template: '@if (isInForm()) {' +
    '<ng-container [formGroup]="formGroup()"><xt-render-sub [context]="subContext(\'currency\')" /></ng-container>' +
    '} @else { <h2>Amount: {{context().value().amount}}</h2>' +
    '<h3><xt-render-sub [context]="subContext(\'currency\')" /></h3>' +
    '}'

})
export class TestMoneyDynamicComponent extends XtCompositeComponent<TestMoney> {
}

type TestMoney= {
  amount:number;
  currency:string;
}

const TEST_MONEY_PLUGIN_INFO={
  name:'TestMoneyPlugin',
  components: [
    {
      componentName:'TestCurrency',
      componentClass:TestCurrencyComponent,
      typesHandled: ['TestCurrency']
    },
    {
      componentName:'TestMoneyDynamic',
      componentClass:TestMoneyDynamicComponent,
      typesHandled: ['TestMoney']
    },
  ],
  types: [
    {
      __type:'TestMoney',
      amount: 'number',
      currency: 'TestCurrency'
    }
  ]
}
