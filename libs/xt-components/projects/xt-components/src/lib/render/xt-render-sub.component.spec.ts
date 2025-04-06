import { TestBed } from '@angular/core/testing';

import { XtRenderSubComponent } from './xt-render-sub.component';
import { Component, output, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { XtSimpleComponent } from '../xt-simple/xt-simple.component';
import { XtCompositeComponent } from '../xt-composite/xt-composite.component';
import { expect } from '@jest/globals';
import { HostTestTypedComponent, HostTestTypedFormComponent } from '../test/xt-test-helper-components';
import { XtResolverService } from '../angular/xt-resolver.service';
import { Button } from 'primeng/button';
import { By } from '@angular/platform-browser';
import { XtPluginRegistry } from '../registry/xt-plugin-registry';

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

  it('should support forms by type', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
        amount: 12.4,
        currency:'EUR'
    });
    hostFixture.componentRef.setInput('valueType', 'TestMoney');
//    hostFixture.componentRef.setInput('controlName', 'payment');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const currencyText = hostFixture.nativeElement.querySelector('#currency_input') as HTMLInputElement;
    expect(currencyText.value).toEqual("EUR");

    const amountText = hostFixture.nativeElement.querySelector('#amount_input') as HTMLInputElement;
    expect(amountText.value).toEqual("12.4");

    host.patchValue('currency',"USD");
    hostFixture.detectChanges();
    expect(currencyText.value).toEqual("USD");

    host.patchValue('amount', 5);
    hostFixture.detectChanges();
    expect(amountText.value).toEqual("5");

    currencyText.value = "GBP";
    currencyText.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(host.retrieveValue('currency')).toEqual("GBP");

    amountText.value = "14";
    amountText.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(host.retrieveValue('amount')).toEqual(14);

  });

  it('should support displaying null value', () => {

    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', null);
    hostFixture.componentRef.setInput('valueType', 'TestMoney');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const textAmount = hostFixture.nativeElement.querySelector('h2');
    expect(textAmount.textContent).toBe('Amount: ');
    const textCurrency = hostFixture.nativeElement.querySelector('h3');
    expect(textCurrency.textContent).toContain('Currency ');

    hostFixture.componentRef.setInput('value', {amount:4.4, currency: 'USD'} as TestMoney);
    hostFixture.detectChanges();
    expect(textAmount.textContent).toBe('Amount: 4.4');
    expect(textCurrency.textContent).toContain('Currency USD');

  });

  it('should support undefined subvalue', () => {

    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', {amount:1.4} as TestMoney);
    hostFixture.componentRef.setInput('valueType', 'TestMoney');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const textAmount = hostFixture.nativeElement.querySelector('h2');
    expect(textAmount.textContent).toBe('Amount: 1.4');
    const textCurrency = hostFixture.nativeElement.querySelector('h3');
    expect(textCurrency.textContent).toContain('Currency ');

    hostFixture.componentRef.setInput('value', {amount:4.4, currency: 'USD'} as TestMoney);
    hostFixture.detectChanges();
    expect(textAmount.textContent).toBe('Amount: 4.4');
    expect(textCurrency.textContent).toContain('Currency USD');

  });

  it('should support editing null values', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      amount: null,
      currency:null
    });
    hostFixture.componentRef.setInput('valueType', 'TestMoney');
//    hostFixture.componentRef.setInput('controlName', 'payment');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const currencyText = hostFixture.nativeElement.querySelector('#currency_input') as HTMLInputElement;
    expect(currencyText.value).toEqual("");

    const amountText = hostFixture.nativeElement.querySelector('#amount_input') as HTMLInputElement;
    expect(amountText.value).toEqual("");

    currencyText.value = "GBP";
    currencyText.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(host.retrieveValue('currency')).toEqual("GBP");

    amountText.value = "14";
    amountText.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(host.retrieveValue('amount')).toEqual(14);

  });

  it('should support outputs', (done) => {

    XtPluginRegistry.registry().registerComponent({
      componentName:'TestOutputComponent',
      componentClass: TestOutputComponent,
      typesHandled: ['TestOutput']
    });

    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', 1);
    hostFixture.componentRef.setInput('valueType', 'TestOutput');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const buttonFixture = hostFixture.debugElement.query(By.directive(Button));
    const buttonComp = buttonFixture.componentInstance as Button;

    const renderFixture=hostFixture.debugElement.query(By.directive(XtRenderSubComponent));
    const renderComponent = renderFixture.componentInstance as XtRenderSubComponent<any>
    expect(renderComponent.outputs.valueSelected).toBeTruthy();
    renderComponent.outputs.valueSelected!.subscribe((newValue) => {
      try {
        expect (newValue).toBeDefined();
        // The value increase has been well sent through the output
        expect (newValue).toEqual(2);
        done();
      } catch (error){
        done (error);
      }
    });

    // Click on the button HTML component
    expect(buttonComp).toBeTruthy();
    expect(buttonFixture.nativeElement.textContent).toBe('Increase 1');

    buttonFixture.nativeElement.children[0].click();
    hostFixture.detectChanges();

    expect(buttonFixture.nativeElement.textContent).toBe('Increase 2');
  });

});



@Component({
  selector: 'test-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '@if (isInForm()) {<ng-container [formGroup]="formGroup()"><input id="currency_input" [name]="formControlName()" type="text" [formControlName]="formControlName()" /></ng-container>} @else {Currency {{context().displayValue()}}}'
})
export class TestCurrencyComponent extends XtSimpleComponent<string> {
}

@Component({
  selector: 'test-money-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,XtRenderSubComponent],
  template: '@if (isInForm()) {' +
    '<ng-container [formGroup]="formGroup()">' +
      '<input id="amount_input" type="number" formControlName="amount" />' +
      '<xt-render-sub [context]="subContext(\'currency\')" />' +
    '</ng-container>' +
    '} @else { <h2>Amount: {{context().value()?.amount}}</h2>' +
    '<h3><xt-render-sub [context]="subContext(\'currency\')" /></h3>' +
    '}'

})
export class TestMoneyDynamicComponent extends XtCompositeComponent<TestMoney> {
}

@Component({
  selector: 'test-output',
  standalone: true,
  imports: [CommonModule, Button],
  template: '<p-button id="sendOutput" label="Increase {{context().displayValue()}}" (onClick)="incrementValue()"></p-button>',
})
export class TestOutputComponent extends XtSimpleComponent<number> {
  selection=output<number>();

  protected override setupInputOutput() {
    this.outputs.valueSelected=this.selection;
  }

  incrementValue (): void {
    const value = this.displayValue();
    this.context().setDisplayValue(value?value+1:1);
    this.selection.emit( this.displayValue()!);
  }
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
  types:
    {
      'TestMoney': {
        amount: 'number',
        currency: 'TestCurrency'
      },
      'TestCurrency': 'string'
    }

}
