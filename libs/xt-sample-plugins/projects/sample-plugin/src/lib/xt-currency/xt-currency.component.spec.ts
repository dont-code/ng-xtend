import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtCurrencyComponent } from './xt-currency.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";
import { XtBaseContext } from 'xt-components';

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
    fixture.componentRef.setInput('context', new XtBaseContext('FULL_VIEW'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
