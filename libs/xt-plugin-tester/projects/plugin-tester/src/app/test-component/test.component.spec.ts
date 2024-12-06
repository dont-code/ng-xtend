import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponent } from './test.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { XtCurrencyComponent, registerSamplePlugin } from 'xt-sample-plugins';
import { XtResolverService } from 'xt-components';
import { By } from '@angular/platform-browser';
import { expect } from '@jest/globals';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerSamplePlugin(TestBed.inject(XtResolverService));
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the proper component', () => {
    const fullViewCurrency=fixture.debugElement.query(By.css('#fullView')).query(By.directive(XtCurrencyComponent));
    expect(fullViewCurrency).toBeTruthy();

    expect(fullViewCurrency.nativeElement.textContent).toContain('GBP');
  });

});
