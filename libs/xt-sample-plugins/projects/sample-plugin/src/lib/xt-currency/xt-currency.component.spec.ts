import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtCurrencyComponent } from './xt-currency.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";

describe('XtCurrencyComponent', () => {
  let component: XtCurrencyComponent;
  let fixture: ComponentFixture<XtCurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtCurrencyComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
