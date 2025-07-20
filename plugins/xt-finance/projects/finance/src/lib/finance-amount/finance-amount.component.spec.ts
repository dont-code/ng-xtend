import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceAmountComponent } from './finance-amount.component';

describe('FinanceAmountComponent', () => {
  let component: FinanceAmountComponent;
  let fixture: ComponentFixture<FinanceAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceAmountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
