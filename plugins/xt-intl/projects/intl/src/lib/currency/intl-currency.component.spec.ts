import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntlCurrencyComponent } from './intl-currency.component';
import { CurrencyTypeHandler } from './currency-type-handler';
import { provideZonelessChangeDetection } from '@angular/core';
import { HostTestTypedComponent, HostTestTypedFormComponent, XtBaseContext, XtResolverService } from 'xt-components';
import { registerInternationalPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

describe('XtCurrencyComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntlCurrencyComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    registerInternationalPlugin(TestBed.inject(XtResolverService));
  });

  it('should create', () => {
    let component: IntlCurrencyComponent;
    let fixture: ComponentFixture<IntlCurrencyComponent>;
    fixture = TestBed.createComponent(IntlCurrencyComponent);
    component = fixture.componentInstance;
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue("");
    fixture.componentRef.setInput('context', context);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should support currency display', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', 'EUR');
    hostFixture.componentRef.setInput('valueType', 'currency');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.textContent).toContain('EUR');

    hostFixture.componentRef.setInput('value', 'USD');
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.textContent).toContain('USD');

  });

  it('should support currency edit', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      currency:'EUR'
    });
    hostFixture.componentRef.setInput('valueType', 'currency');
    hostFixture.componentRef.setInput('controlName', 'currency');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const currencyComponent = hostFixture.debugElement.query(By.directive(IntlCurrencyComponent));
    expect(currencyComponent).toBeTruthy();
    const input = currencyComponent.query(By.css('input'));

    expect(input.nativeElement.value).toEqual ('EUR');

    host.patchValue('currency',"USD");
    hostFixture.detectChanges();
    expect(input.nativeElement.value).toEqual ("USD");

  });

  it('should be sortable by currency code through its type handler', () => {
    const resolverService = TestBed.inject(XtResolverService);
    const found = resolverService.typeResolver.findTypeHandler('currency');
    expect(found.typeName).toEqual('string');
    const handler = found.handler!;
    expect(handler).toBeInstanceOf(CurrencyTypeHandler);
    expect(handler.isSortable()).toBe(true);

    expect(handler.compareTo('EUR', 'USD')).toBeLessThan(0);
    expect(handler.compareTo('USD', 'EUR')).toBeGreaterThan(0);
    expect(handler.compareTo('EUR', 'EUR')).toBe(0);

    const currencies = ['USD', 'EUR', 'AUD', 'GBP'];
    const sorted = [...currencies].sort((a, b) => handler.compareTo(a, b));
    expect(sorted).toEqual(['AUD', 'EUR', 'GBP', 'USD']);
  });

});
