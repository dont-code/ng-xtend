import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtMoneyComponent } from './xt-money.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";
import { HostTestTypedComponent, HostTestTypedFormComponent, XtBaseContext, XtResolverService } from 'xt-components';
import { XtCurrencyComponent } from '../xt-currency/xt-currency.component';
import { registerSamplePlugin } from '../register';
import { expect } from '@jest/globals';
import { By } from '@angular/platform-browser';
import { InputNumber } from 'primeng/inputnumber';

describe('XtMoneyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtCurrencyComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
      .compileComponents();

    registerSamplePlugin(TestBed.inject(XtResolverService));
  });

  it('should create', () => {
    let component: XtMoneyComponent;
    let fixture: ComponentFixture<XtMoneyComponent>;
    fixture = TestBed.createComponent(XtMoneyComponent);
    component = fixture.componentInstance;
    const context =  new XtBaseContext('FULL_VIEW');
    context.setDisplayValue({amount:0.0, currency:'EUR'});
    fixture.componentRef.setInput('context', context);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should support money display', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', { amount:12, currency:'EUR'});
    hostFixture.componentRef.setInput('valueType', 'money');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.textContent).toContain('€12.00');

    hostFixture.componentRef.setInput('value', { amount:14, currency:'USD'});
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.textContent).toContain('$14.00');

  });

  it('should support money edit', () => {
    const hostFixture = TestBed.createComponent<HostTestTypedFormComponent>(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      amount:12,
      currency:['EUR']
    });
    hostFixture.componentRef.setInput('valueType', 'money');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const moneyComponent = hostFixture.debugElement.query(By.directive(XtMoneyComponent));
    expect(moneyComponent).toBeTruthy();
    const currency=moneyComponent.query(By.css('input[type="text"]'));
    const amount = moneyComponent.query(By.directive(InputNumber));
    expect(amount.componentInstance.value).toEqual (12);
    expect(currency.nativeElement.value).toEqual('EUR');

    host.computedFormGroup().patchValue({currency:"USD"});
    hostFixture.detectChanges();
    expect(currency.nativeElement.value).toEqual ("USD");

    currency.nativeElement.value='GBP';
    currency.nativeElement.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(host.retrieveValue('currency')).toEqual('GBP');
  });

  it('should support edit with no value', () => {
    const hostFixture = TestBed.createComponent<HostTestTypedFormComponent>(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('valueType', 'money');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const formGroup = host.computedFormGroup();

    const moneyComponent = hostFixture.debugElement.query(By.directive(XtMoneyComponent));
    expect(moneyComponent).toBeTruthy();
    const currency=moneyComponent.query(By.css('input[type="text"]'));
    let amount = moneyComponent.query(By.directive(InputNumber));
    expect(amount.componentInstance.value).toEqual (null);
    expect(amount.componentInstance.mode).toEqual ("decimal");
    expect(currency.nativeElement.value).toEqual("");

    /*const amountInput=amount.query(By.css('input'));
    amountInput.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {key:'1'}));
    amountInput.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {key:'2'}));
    hostFixture.detectChanges();
    amountInput.nativeElement.value="12";
    amountInput.nativeElement.dispatchEvent(new Event('input'));
    amount.componentInstance.value=12;*/
    formGroup.patchValue({amount:12.5});
    hostFixture.detectChanges();
    expect(amount.componentInstance.value).toEqual (12.5);

    host.computedFormGroup().patchValue({currency:"USD"});
    hostFixture.detectChanges();
    expect(currency.nativeElement.value).toEqual ("USD");

    amount = moneyComponent.query(By.directive(InputNumber));
    expect(amount.componentInstance.mode).toEqual ("currency");
    expect(amount.componentInstance.value).toEqual (12.5);

    expect(host.computedFormGroup().value).toEqual({currency:"USD", amount:12.5});
  });

  it('should support wrong currency edit', () => {
    const hostFixture = TestBed.createComponent<HostTestTypedFormComponent>(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      amount:12,
      currency:null
    });
    hostFixture.componentRef.setInput('valueType', 'money');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const moneyComponent = hostFixture.debugElement.query(By.directive(XtMoneyComponent));
    expect(moneyComponent).toBeTruthy();
    const currency=moneyComponent.query(By.css('input[type="text"]'));
    let amount = moneyComponent.query(By.directive(InputNumber));
    expect(amount.componentInstance.value).toEqual (12);
    expect(currency.nativeElement.value).toEqual("");

    currency.nativeElement.value='RRR';
    currency.nativeElement.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(currency.nativeElement.value).toEqual ("RRR");

    amount = moneyComponent.query(By.directive(InputNumber));
    expect(amount.componentInstance.value).toEqual (12);
      // As it's a wrong currency, it should still be decimal
    expect(amount.componentInstance.mode).toEqual ("decimal");
  });

});
