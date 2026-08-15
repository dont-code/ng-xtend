import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceAmountComponent } from './finance-amount.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { MoneyAmount } from '../money-handler/money-amount';
import { MoneyAmountHandler } from '../money-handler/money-amount-handler';
import { registerFinancePlugin } from '../register';
import { By } from '@angular/platform-browser';

describe('FinanceAmountComponent', () => {
  let component: FinanceAmountComponent;
  let fixture: ComponentFixture<FinanceAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceAmountComponent]
    })
    .compileComponents();

    registerFinancePlugin(TestBed.inject(XtResolverService));
  });

  it('should display amount', () => {
    fixture = TestBed.createComponent(FinanceAmountComponent);
    const context=new XtBaseContext<MoneyAmount>('FULL_VIEW');
    context.setDisplayValue({
     currency:'EUR',
     amount:12.4
    });
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    const textContent=fixture.debugElement.query(By.css('span') ).nativeElement.textContent;
    expect(textContent).contains('12');
    expect(textContent).contains('40');
    expect(textContent).contains('€');

  });

  it('should be sortable by amount through its type handler', () => {
    const resolverService = TestBed.inject(XtResolverService);
    const found = resolverService.typeResolver.findTypeHandler('money-amount');
    expect(found.typeName).toEqual('money-amount');
    const handler = found.handler!;
    expect(handler).toBeInstanceOf(MoneyAmountHandler);
    expect(handler.isSortable()).toBe(true);

    expect(handler.compareTo({ amount: 12.4, currency: 'EUR' }, { amount: 8, currency: 'EUR' })).toBeGreaterThan(0);
    expect(handler.compareTo({ amount: 8, currency: 'EUR' }, { amount: 12.4, currency: 'USD' })).toBeLessThan(0);
    expect(handler.compareTo({ amount: 5, currency: 'EUR' }, { amount: 5, currency: 'USD' })).toBe(0);

    const amounts = [
      { amount: 12, currency: 'EUR' },
      { amount: 5, currency: 'USD' },
      { amount: 8, currency: 'EUR' }
    ];
    const sorted = [...amounts].sort((a, b) => handler.compareTo(a, b));
    expect(sorted.map((value) => value.amount)).toEqual([5, 8, 12]);
  });
});
