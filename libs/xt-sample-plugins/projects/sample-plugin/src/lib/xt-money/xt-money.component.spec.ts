import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtMoneyComponent } from './xt-money.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";
import { XtBaseContext } from 'xt-components';

describe('XtMoneyComponent', () => {
  let component: XtMoneyComponent;
  let fixture: ComponentFixture<XtMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtMoneyComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtMoneyComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('context', new XtBaseContext('FULL_VIEW'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
