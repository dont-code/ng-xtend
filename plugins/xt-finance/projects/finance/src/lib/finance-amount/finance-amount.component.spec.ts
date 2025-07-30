import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceAmountComponent } from './finance-amount.component';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { XtBaseContext } from 'xt-components';
import { MoneyAmount } from '../money-handler/money-amount';
import { By } from '@angular/platform-browser';

describe('FinanceAmountComponent', () => {
  let component: FinanceAmountComponent;
  let fixture: ComponentFixture<FinanceAmountComponent>;

  beforeAll(() => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceAmountComponent]
    })
    .compileComponents();

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
});
